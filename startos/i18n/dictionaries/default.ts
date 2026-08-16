export const DEFAULT_LANG = 'en_US'

const dict = {
  'Starting Beszel!': 0,
  'Beszel is ready': 1,
  'Beszel is still starting. If this persists, please check the logs.': 2,
  'Web Interface': 3,
  'Web-based dashboard for viewing system metrics and managing monitored systems': 4,
  'Local Agent': 5,
  'The local agent is running': 6,
  'The local agent is not running. Check the service logs for registration errors.': 7,
  'Enable Local Agent': 8,
  'Automatically register this Beszel package as a monitored system.': 9,
  'System Name': 10,
  'Name shown for the automatically registered system.': 11,
  'Hub Public Key': 12,
  'Copy the SSH public key shown by Beszel when configuring an agent.': 13,
  'Universal Token': 14,
  'Create a permanent universal token in Beszel under Settings > Tokens. Leave blank to keep the saved token.': 15,
  'Configure Local Agent': 16,
  'Enable or update automatic registration of this package in Beszel.': 17,
  'Changing the token after successful registration can create a duplicate system. Keep the original token unless you intentionally remove the old system first.': 18,
  'Local Agent Configuration Saved': 19,
  'The local agent will start and register automatically.': 20,
  'The local agent is disabled.': 21,
  'After creating your Beszel account, configure the local agent to register this package automatically.': 22,
  'Primary Temperature Sensor': 23,
  'Optional sensor name used for the temperature shown in the systems table, for example coretemp_package_id_0.': 24,

  'Configure Hub': 25,
  'Configure the canonical Beszel URL and optional heartbeat monitoring.': 26,
  'Primary URL': 27,
  'URL Beszel uses for externally generated links and external agent configuration.': 28,
  'No Beszel Web UI URLs are currently available in StartOS.': 29,
  'Heartbeat URL': 30,
  'Optional HTTP(S) endpoint Beszel calls as a heartbeat. Leave blank to disable heartbeat.': 31,
  'Heartbeat Interval': 32,
  'Interval in seconds between heartbeat requests.': 33,
  'Heartbeat Method': 34,
  'HTTP method used for heartbeat requests.': 35,
  'Hub Configuration Saved': 39,
  'The Beszel Hub configuration has been saved. If Beszel is running, it will restart automatically to apply the changes.': 40,
  'Choose the primary Beszel URL used for externally generated links and external agent configuration. Heartbeat monitoring is optional.': 41,
} as const

export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict
