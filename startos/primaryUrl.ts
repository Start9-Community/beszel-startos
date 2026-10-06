import { hubConfigJson } from './fileModels/hubConfig'
import { i18n } from './i18n'
import { sdk } from './sdk'
import { webInterfaceId, webMultiHostId } from './utils'

export const primaryUrl = sdk.setupPrimaryUrl({
  id: 'set-hub-config',
  hostId: webMultiHostId,
  interfaceId: webInterfaceId,
  metadata: {
    name: i18n('Set Primary URL'),
    description: i18n(
      'Choose the URL Beszel puts in the links it generates and in the install commands it shows for remote agents. Beszel restarts to apply the change.',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  },
  field: { name: i18n('Primary URL'), description: null },
  get: hubConfigJson.read((c) => c.primaryUrl),
  set: (effects, url) => hubConfigJson.merge(effects, { primaryUrl: url }),
})
