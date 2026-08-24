import { i18n } from './i18n'
import { sdk } from './sdk'
import { httpPort, webInterfaceId, webMultiHostId } from './utils'

export const setInterfaces = sdk.setupInterfaces(async ({ effects }) => {
  const multi = sdk.MultiHost.of(effects, webMultiHostId)
  const multiOrigin = await multi.bindPort(httpPort, { protocol: 'http' })

  const webInterface = sdk.createInterface(effects, {
    name: i18n('Web UI'),
    id: webInterfaceId,
    description: i18n(
      'Web-based dashboard for viewing system metrics and managing monitored systems',
    ),
    type: 'ui',
    masked: false,
    schemeOverride: null,
    username: null,
    path: '',
    query: {},
  })

  return [await multiOrigin.export([webInterface])]
})
