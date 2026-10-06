export const DEFAULT_LANG = 'en_US'

const dict = {
  // main.ts
  'Starting Beszel!': 0,
  'No non-local Beszel Web UI address is available. Publish a LAN, Tor, or domain address for the Web UI interface.': 1,
  'Web Interface': 2,
  'Beszel is ready': 3,
  'Beszel is still starting. If this persists, check the service logs.': 4,
  'Local Agent': 5,
  'The local agent is running': 6,
  'The local agent is not running. Check the service logs for registration errors.': 7,

  // interfaces.ts
  'Web UI': 8,
  'Web-based dashboard for viewing system metrics and managing monitored systems': 9,

  // init/hubConfig.ts
  'Choose the URL Beszel puts in the links it generates and in the install commands it shows for remote agents.': 10,

  // init/localAgent.ts
  'After creating your Beszel account, configure the local agent to register this package automatically.': 11,

  // primaryUrl.ts
  'Set Primary URL': 46,
  'Choose the URL Beszel puts in the links it generates and in the install commands it shows for remote agents. Beszel restarts to apply the change.': 15,
  'Primary URL': 14,

  // actions/setHeartbeat.ts
  'Configure Heartbeat': 12,
  'Have Beszel call an external endpoint on an interval, so an outside monitor can tell the hub is running.': 13,
  'Heartbeat URL': 17,
  'Optional HTTP(S) endpoint Beszel calls as a heartbeat. Leave blank to disable heartbeat.': 18,
  'Heartbeat Interval': 19,
  'Interval in seconds between heartbeat requests.': 20,
  'Heartbeat Method': 21,
  '- POST: Each heartbeat carries a JSON summary of system status, down systems and triggered alerts\n- GET: Each heartbeat is a plain request with no body\n- HEAD: Like GET, but the endpoint returns headers only': 22,
  'Heartbeat URL must be a valid HTTP or HTTPS URL.': 23,
  'Heartbeat Saved': 26,
  'The heartbeat settings have been saved. If Beszel is running, it restarts automatically to apply them.': 27,

  // actions/configureLocalAgent.ts
  'Configure Local Agent': 28,
  'Enable or update automatic registration of this package in Beszel.': 29,
  'Changing the token after successful registration can create a duplicate system. Keep the original token unless you intentionally remove the old system first.': 30,
  'Enable Local Agent': 31,
  'Automatically register this Beszel package as a monitored system.': 32,
  'System Name': 33,
  'Name shown for the automatically registered system.': 34,
  'Primary Temperature Sensor': 35,
  'Optional sensor name used for the temperature shown in the systems table, for example coretemp_package_id_0.': 36,
  'Hub Public Key': 37,
  'Copy the SSH public key shown by Beszel when configuring an agent.': 38,
  'Universal Token': 39,
  'Create a permanent universal token in Beszel under Settings > Tokens. Leave blank to keep the saved token.': 40,
  'Hub public key, universal token, and system name are all required when the local agent is enabled.': 41,
  'Hub public key must be in OpenSSH authorized_keys format.': 42,
  'Local Agent Configuration Saved': 43,
  'The local agent will start and register automatically.': 44,
  'The local agent is disabled.': 45,
} as const

/**
 * Plumbing. DO NOT EDIT.
 */
export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict
