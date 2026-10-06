import {
  type HubConfig,
  hubConfigDefaults,
  hubConfigJson,
} from '../fileModels/hubConfig'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

const { InputSpec, Value } = sdk

const readHubConfig = async (): Promise<HubConfig> =>
  (await hubConfigJson.read().once()) ?? hubConfigDefaults

// Normalizing to an origin would strip a path the endpoint needs, so the
// heartbeat URL is validated but kept verbatim.
function validateHeartbeatUrl(value: string | null | undefined): string {
  const heartbeatUrl = value?.trim() ?? ''

  if (!heartbeatUrl) return ''

  try {
    const { protocol } = new URL(heartbeatUrl)
    if (protocol !== 'http:' && protocol !== 'https:') throw new Error()
  } catch {
    throw new Error(i18n('Heartbeat URL must be a valid HTTP or HTTPS URL.'))
  }

  return heartbeatUrl
}

const inputSpec = InputSpec.of({
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
    description: i18n('Interval in seconds between heartbeat requests.'),
    required: true,
    default: hubConfigDefaults.heartbeatInterval,
    integer: true,
    min: 1,
    step: 1,
  }),

  heartbeatMethod: Value.select({
    name: i18n('Heartbeat Method'),
    description: i18n(
      '- POST: Each heartbeat carries a JSON summary of system status, down systems and triggered alerts\n- GET: Each heartbeat is a plain request with no body\n- HEAD: Like GET, but the endpoint returns headers only',
    ),
    default: hubConfigDefaults.heartbeatMethod,
    values: {
      POST: 'POST',
      GET: 'GET',
      HEAD: 'HEAD',
    },
  }),
})

export const setHeartbeat = sdk.Action.withInput(
  'set-heartbeat',
  {
    name: i18n('Configure Heartbeat'),
    description: i18n(
      'Have Beszel call an external endpoint on an interval, so an outside monitor can tell the hub is running.',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  },
  inputSpec,

  async () => {
    const config = await readHubConfig()

    return {
      heartbeatUrl: config.heartbeatUrl.trim() || null,
      heartbeatInterval: config.heartbeatInterval,
      heartbeatMethod: config.heartbeatMethod,
    }
  },

  async ({ effects, input }) => {
    await hubConfigJson.merge(effects, {
      heartbeatUrl: validateHeartbeatUrl(input.heartbeatUrl),
      heartbeatInterval: input.heartbeatInterval,
      heartbeatMethod: input.heartbeatMethod,
    })

    return {
      version: '1',
      title: i18n('Heartbeat Saved'),
      message: i18n(
        'The heartbeat settings have been saved. If Beszel is running, it restarts automatically to apply them.',
      ),
      result: null,
    }
  },
)
