import { promises as fs } from 'node:fs'
import { i18n } from '../i18n'
import {
  agentConfigJson,
  hubCaCertFile,
  hubPublicKeyFile,
  universalTokenFile,
} from '../fileModels/agentConfig'
import { sdk } from '../sdk'

const { InputSpec, Value } = sdk

function validateHubUrl(value: string | null | undefined): string {
  const hubUrl = value?.trim() ?? ''
  if (!hubUrl) return ''
  try {
    const { protocol, host } = new URL(hubUrl)
    if ((protocol !== 'http:' && protocol !== 'https:') || !host)
      throw new Error()
  } catch {
    throw new Error(i18n('External hub URL must be a valid HTTP or HTTPS URL.'))
  }
  return hubUrl
}

const inputSpec = InputSpec.of({
  enabled: Value.toggle({
    name: i18n('Enable Local Agent'),
    description: i18n(
      'Automatically register this Beszel package as a monitored system.',
    ),
    default: false,
  }),
  systemName: Value.text({
    name: i18n('System Name'),
    description: i18n('Name shown for the automatically registered system.'),
    required: true,
    default: 'StartOS',
  }),
  primarySensor: Value.text({
    name: i18n('Primary Temperature Sensor'),
    description: i18n(
      'Optional sensor name used for the temperature shown in the systems table, for example coretemp_package_id_0.',
    ),
    required: false,
    default: null,
  }),
  hubUrl: Value.text({
    name: i18n('External Hub URL'),
    description: i18n(
      "Leave blank to report to the hub in this service. To report to a Beszel hub running elsewhere instead, enter its address, for example https://beszel.example.com, and use that hub's public key and token below.",
    ),
    required: false,
    default: null,
    inputmode: 'url',
    placeholder: 'https://beszel.example.com',
  }),
  hubPublicKey: Value.text({
    name: i18n('Hub Public Key'),
    description: i18n(
      'Copy the SSH public key shown by Beszel when configuring an agent.',
    ),
    required: false,
    default: null,
  }),
  universalToken: Value.text({
    name: i18n('Universal Token'),
    description: i18n(
      'Create a permanent universal token in Beszel under Settings > Tokens. Leave blank to keep the saved token.',
    ),
    required: false,
    masked: true,
    default: null,
  }),
  hubCaCert: Value.textarea({
    name: i18n('External Hub CA Certificate'),
    description: i18n(
      "Only for an external hub whose HTTPS certificate is issued by a private certificate authority, such as another StartOS server's root CA. Paste that authority's PEM certificate.",
    ),
    required: false,
    default: null,
    placeholder: '-----BEGIN CERTIFICATE-----',
  }),
})

export const configureLocalAgent = sdk.Action.withInput(
  'configure-local-agent',
  {
    name: i18n('Configure Local Agent'),
    description: i18n(
      'Enable or update automatic registration of this package in Beszel.',
    ),
    warning: i18n(
      'Changing the token after successful registration can create a duplicate system. Keep the original token unless you intentionally remove the old system first.',
    ),
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  },
  inputSpec,

  async () => {
    const config = await agentConfigJson.read().once()
    return {
      enabled: config?.enabled ?? false,
      systemName: config?.systemName || 'StartOS',
      primarySensor: config?.primarySensor || null,
      hubUrl: config?.hubUrl || null,
      hubPublicKey: (await hubPublicKeyFile.read().once())?.trim() || null,
      // A stored secret is never sent back through the action-input RPC.
      universalToken: null,
      hubCaCert: (await hubCaCertFile.read().once())?.trim() || null,
    }
  },

  async ({ effects, input }) => {
    const hubPublicKey =
      input.hubPublicKey?.trim() ||
      (await hubPublicKeyFile.read().once())?.trim() ||
      ''
    const universalToken =
      input.universalToken?.trim() ||
      (await universalTokenFile.read().once())?.trim() ||
      ''
    const systemName = input.systemName.trim()
    const hubUrl = validateHubUrl(input.hubUrl)
    const hubCaCert = input.hubCaCert?.trim() ?? ''

    if (input.enabled && (!hubPublicKey || !universalToken || !systemName)) {
      throw new Error(
        i18n(
          'Hub public key, universal token, and system name are all required when the local agent is enabled.',
        ),
      )
    }
    if (input.enabled && !hubPublicKey.startsWith('ssh-')) {
      throw new Error(
        i18n('Hub public key must be in OpenSSH authorized_keys format.'),
      )
    }
    if (hubCaCert && !hubCaCert.includes('-----BEGIN CERTIFICATE-----')) {
      throw new Error(
        i18n('External hub CA certificate must be in PEM format.'),
      )
    }

    await hubPublicKeyFile.write(effects, hubPublicKey)
    await universalTokenFile.write(effects, universalToken)
    await fs.chmod(universalTokenFile.path, 0o600)
    await hubCaCertFile.write(effects, hubCaCert ? `${hubCaCert}\n` : '')
    await agentConfigJson.merge(effects, {
      enabled: input.enabled,
      systemName: systemName || 'StartOS',
      primarySensor: input.primarySensor?.trim() || '',
      hubUrl,
    })

    return {
      version: '1',
      title: i18n('Local Agent Configuration Saved'),
      message: input.enabled
        ? i18n('The local agent will start and register automatically.')
        : i18n('The local agent is disabled.'),
      result: null,
    }
  },
)
