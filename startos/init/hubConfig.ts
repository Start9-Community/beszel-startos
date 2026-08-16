import { setHubConfig } from '../actions/setHubConfig'
import { hubConfigJson } from '../fileModels/hubConfig'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import {
  getWebUiInterfaceUrls,
  normalizeOrigin,
} from '../utils'

export const setupHubConfig = sdk.setupOnInit(async (effects) => {
  await hubConfigJson.merge(effects, {})

  const hubConfig = await hubConfigJson.read().const(effects)
  const availableUrls = await getWebUiInterfaceUrls(effects)

  const primaryUrl = normalizeOrigin(
    hubConfig?.primaryUrl ?? '',
  )

  const primaryUrlAvailable =
    primaryUrl !== null &&
    availableUrls.includes(primaryUrl)

  if (!primaryUrlAvailable) {
    await sdk.action.createOwnTask(
      effects,
      setHubConfig,
      'important',
      {
        reason: i18n(
          'Choose the primary Beszel URL used for externally generated links and external agent configuration. Heartbeat monitoring is optional.',
        ),
      },
    )
  }
})
