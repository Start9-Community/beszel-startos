import { type T } from '@start9labs/start-sdk'
import {
  type HubConfig,
  hubConfigDefaults,
  hubConfigJson,
} from '../fileModels/hubConfig'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import {
  discoverCanonicalHubUrl,
  getWebUiInterfaceUrls,
  normalizeOrigin,
} from '../utils'

const { InputSpec, Value } = sdk

async function readHubConfig(): Promise<HubConfig> {
  try {
    const config = await hubConfigJson.read().once()
    return config ?? { ...hubConfigDefaults }
  } catch {
    return { ...hubConfigDefaults }
  }
}

function validateHeartbeatUrl(value: string | null | undefined): string {
  const heartbeatUrl = value?.trim() ?? ''

  if (!heartbeatUrl) return ''

  try {
    const parsed = new URL(heartbeatUrl)

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      throw new Error()
    }
  } catch {
    throw new Error('Heartbeat URL must be a valid HTTP or HTTPS URL.')
  }

  return heartbeatUrl
}

const inputSpec = InputSpec.of({
  primaryUrl: Value.dynamicSelect(async ({ effects }) => {
    const [urls, canonicalUrl] = await Promise.all([
      getWebUiInterfaceUrls(effects),
      discoverCanonicalHubUrl(effects),
    ])

    return {
      name: i18n('Primary URL'),
      description: i18n(
        'URL Beszel uses for externally generated links and external agent configuration.',
      ),
      values: urls.reduce(
        (values, url) => ({
          ...values,
          [url]: url,
        }),
        {} as Record<string, string>,
      ),
      default: canonicalUrl,
      disabled:
        urls.length === 0
          ? i18n(
              'No Beszel Web UI URLs are currently available in StartOS.',
            )
          : false,
    }
  }),

  heartbeatUrl: Value.text({
    name: i18n('Heartbeat URL'),
    description: i18n(
      'Optional HTTP(S) endpoint Beszel calls as a heartbeat. Leave blank to disable heartbeat.',
    ),
    required: false,
    masked: true,
    default: null,
  }),

  heartbeatInterval: Value.number({
    name: i18n('Heartbeat Interval'),
    description: i18n(
      'Interval in seconds between heartbeat requests.',
    ),
    required: true,
    default: hubConfigDefaults.heartbeatInterval,
    integer: true,
    min: 1,
    step: 1,
  }),

  heartbeatMethod: Value.select({
    name: i18n('Heartbeat Method'),
    description: i18n('HTTP method used for heartbeat requests.'),
    default: hubConfigDefaults.heartbeatMethod,
    values: {
      POST: 'POST',
      GET: 'GET',
      HEAD: 'HEAD',
    },
  }),
})

export const setHubConfig = sdk.Action.withInput(
  'set-hub-config',
  {
    name: i18n('Configure Hub'),
    description: i18n(
      'Configure the canonical Beszel URL and optional heartbeat monitoring.',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  },
  inputSpec,

  async ({ effects }) => {
    const config = await readHubConfig()
    const availableUrls = await getWebUiInterfaceUrls(effects)
    const storedPrimaryUrl = normalizeOrigin(config.primaryUrl)

    const primaryUrl =
      storedPrimaryUrl && availableUrls.includes(storedPrimaryUrl)
        ? storedPrimaryUrl
        : await discoverCanonicalHubUrl(effects)

    return {
      primaryUrl,
      heartbeatUrl: config.heartbeatUrl.trim() || null,
      heartbeatInterval: config.heartbeatInterval,
      heartbeatMethod: config.heartbeatMethod,
    }
  },

  async ({ effects, input }) => {
    const primaryUrl = normalizeOrigin(input.primaryUrl)

    if (!primaryUrl) {
      throw new Error('Primary URL must be a valid HTTP or HTTPS URL.')
    }

    const availableUrls = await getWebUiInterfaceUrls(effects)

    if (!availableUrls.includes(primaryUrl)) {
      throw new Error(
        'Primary URL must be one of the Web UI URLs currently exposed by StartOS.',
      )
    }

    const heartbeatUrl = validateHeartbeatUrl(input.heartbeatUrl)

    await hubConfigJson.merge(effects, {
      primaryUrl,
      heartbeatUrl,
      heartbeatInterval: input.heartbeatInterval,
      heartbeatMethod: input.heartbeatMethod,
    })

    return {
      version: '1',
      title: i18n('Hub Configuration Saved'),
      message: i18n('The Beszel Hub configuration has been saved. If Beszel is running, it will restart automatically to apply the changes.'),
      result: null,
    }
  },
)
