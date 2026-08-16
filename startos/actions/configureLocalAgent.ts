import { i18n } from '../i18n'
import { agentConfigJson } from '../fileModels/agentConfig'
import { sdk } from '../sdk'

const { InputSpec, Value } = sdk
const agentVolume = sdk.volumes.agent

async function readAgentFile(subpath: string): Promise<string> {
  try {
    return String(await agentVolume.readFile(subpath, 'utf8')).trim()
  } catch {
    return ''
  }
}

async function readAgentConfig(): Promise<{
  enabled: boolean
  systemName: string
  primarySensor: string
}> {
  try {
    const raw = await agentVolume.readFile('config.json', 'utf8')
    const parsed = JSON.parse(String(raw)) as Record<string, unknown>
    return {
      enabled: parsed.enabled === true,
      systemName:
        typeof parsed.systemName === 'string' && parsed.systemName.trim()
          ? parsed.systemName.trim()
          : 'StartOS',
      primarySensor:
        typeof parsed.primarySensor === 'string'
          ? parsed.primarySensor.trim()
          : '',
    }
  } catch {
    return { enabled: false, systemName: 'StartOS', primarySensor: '' }
  }
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
    const config = await readAgentConfig()
    const hubPublicKey = await readAgentFile('hub.pub')
    return {
      enabled: config.enabled,
      systemName: config.systemName,
      primarySensor: config.primarySensor || null,
      hubPublicKey: hubPublicKey || null,
      // Never send a stored secret back through the action-input RPC.
      universalToken: null,
    }
  },
  async ({ effects, input }) => {
    const savedHubPublicKey = await readAgentFile('hub.pub')
    const savedUniversalToken = await readAgentFile('universal-token')
    const hubPublicKey = input.hubPublicKey?.trim() || savedHubPublicKey
    const universalToken = input.universalToken?.trim() || savedUniversalToken
    const systemName = input.systemName.trim()
    const primarySensor = input.primarySensor?.trim() || ''

    if (input.enabled && (!hubPublicKey || !universalToken || !systemName)) {
      throw new Error(
        'Hub public key, universal token, and system name are required when the local agent is enabled',
      )
    }
    if (input.enabled && !hubPublicKey.startsWith('ssh-')) {
      throw new Error(
        'Hub public key must be in OpenSSH authorized_keys format',
      )
    }

    await agentVolume.writeFile('hub.pub', hubPublicKey, { mode: 0o644 })
    await agentVolume.writeFile('universal-token', universalToken, {
      mode: 0o600,
    })
    await agentConfigJson.merge(effects, {
      enabled: input.enabled,
      systemName: systemName || 'StartOS',
      primarySensor,
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
