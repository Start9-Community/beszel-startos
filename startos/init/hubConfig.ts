import { hubConfigJson } from '../fileModels/hubConfig'
import { i18n } from '../i18n'
import { primaryUrl } from '../primaryUrl'
import { sdk } from '../sdk'

export const seedHubConfig = sdk.setupOnInit(async (effects) => {
  await hubConfigJson.merge(effects, {})
})

export const primaryUrlTask = primaryUrl.setupTask('important', {
  reason: i18n(
    'Choose the URL Beszel puts in the links it generates and in the install commands it shows for remote agents.',
  ),
})
