import { sdk } from './sdk'
import { httpPort, log, webInterfaceId, webMultiHostId } from './utils'

export const setInterfaces = sdk.setupInterfaces(async ({ effects }) => {
  log('Setting up web interface', {
    interfaceId: webInterfaceId,
    multiHostId: webMultiHostId,
    httpPort,
  })

  const webInterface = sdk.createInterface(effects, {
    name: 'Web UI',
    id: webInterfaceId,
    description:
      'Web-based dashboard for viewing system metrics and managing monitored systems',
    type: 'ui',
    masked: false,
    schemeOverride: null,
    username: null,
    path: '',
    query: {},
  })
  log('Web interface descriptor created', {
    interfaceId: webInterfaceId,
    name: 'Web UI',
    type: 'ui',
  })

  const multi = sdk.MultiHost.of(effects, webMultiHostId)
  log('Binding web interface port', {
    multiHostId: webMultiHostId,
    httpPort,
    protocol: 'http',
  })
  const multiOrigin = await multi.bindPort(httpPort, { protocol: 'http' })
  const receipt = await multiOrigin.export([webInterface])
  log('Web interface exported', {
    interfaceId: webInterfaceId,
    receipt,
  })
  return [receipt]
})
