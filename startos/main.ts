import { sdk } from './sdk'
import {
  agentConfigJson,
  hubPublicKeyFile,
  universalTokenFile,
} from './fileModels/agentConfig'
import { hubConfigDefaults, hubConfigJson } from './fileModels/hubConfig'
import { i18n } from './i18n'
import {
  agentMountVolume,
  agentPort,
  discoverCanonicalHubUrl,
  httpPort,
  localHubUrl,
  mountVolume,
  serviceName,
  subcontainerName,
} from './utils'

// Both upstream images are FROM scratch: no /etc/passwd, no /etc/group, and no
// shell. Subcontainer exec resolves a user against those files, so they have to
// exist before the daemon spawns anything.
async function writeAccountFiles(subcontainer: {
  writeFile: (path: string, content: string) => Promise<unknown>
}) {
  await subcontainer.writeFile('/etc/passwd', 'root:x:0:0:root:/root:/bin/sh\n')
  await subcontainer.writeFile('/etc/group', 'root:x:0:\n')
}

function forwardAgentLog(
  stream: 'stdout' | 'stderr',
  secret: string,
): (chunk: Buffer | string) => void {
  return (chunk) => {
    let output = String(chunk).trimEnd()
    if (!output) return
    if (secret) output = output.split(secret).join('[REDACTED]')
    const message = `[beszel-agent ${stream}] ${output}`
    if (stream === 'stderr') console.error(message)
    else console.log(message)
  }
}

export const main = sdk.setupMain(async ({ effects }) => {
  console.info(i18n('Starting Beszel!'))

  const hubConfig =
    (await hubConfigJson.read().const(effects)) ?? hubConfigDefaults

  const primaryUrl =
    hubConfig.primaryUrl.trim() || (await discoverCanonicalHubUrl(effects))

  if (!primaryUrl) {
    throw new Error(
      i18n(
        'No non-local Beszel Web UI address is available. Publish a LAN, Tor, or domain address for the Web UI interface, then run Configure Hub.',
      ),
    )
  }

  const heartbeatUrl = hubConfig.heartbeatUrl.trim()

  const subcontainer = await sdk.SubContainer.of(
    effects,
    { imageId: serviceName },
    sdk.Mounts.of().mountVolume(mountVolume),
    subcontainerName,
  )
  await writeAccountFiles(subcontainer)

  const daemons = sdk.Daemons.of(effects).addDaemon(serviceName, {
    subcontainer,
    exec: {
      command: sdk.useEntrypoint(),
      env: {
        APP_URL: primaryUrl,
        ...(heartbeatUrl
          ? {
              HEARTBEAT_URL: heartbeatUrl,
              HEARTBEAT_INTERVAL: String(hubConfig.heartbeatInterval),
              HEARTBEAT_METHOD: hubConfig.heartbeatMethod,
            }
          : {}),
      },
    },
    ready: {
      display: i18n('Web Interface'),
      fn: () =>
        sdk.healthCheck.checkWebUrl(effects, localHubUrl, {
          timeout: 60_000,
          successMessage: i18n('Beszel is ready'),
          errorMessage: i18n(
            'Beszel is still starting. If this persists, check the service logs.',
          ),
        }),
    },
    requires: [],
  })

  const agentConfig = await agentConfigJson.read().const(effects)
  const hubPublicKey = (await hubPublicKeyFile.read().const(effects))?.trim()
  const universalToken = (
    await universalTokenFile.read().const(effects)
  )?.trim()

  if (!agentConfig?.enabled || !hubPublicKey || !universalToken) return daemons

  const agentSubcontainer = await sdk.SubContainer.of(
    effects,
    { imageId: 'beszel-agent' },
    sdk.Mounts.of().mountVolume(agentMountVolume),
    'beszel-agent',
  )
  await writeAccountFiles(agentSubcontainer)

  return daemons.addDaemon('local-agent', {
    subcontainer: agentSubcontainer,
    exec: {
      command: sdk.useEntrypoint(),
      env: {
        LISTEN: String(agentPort),
        SYSTEM_NAME: agentConfig.systemName,
        KEY_FILE: `${agentMountVolume.mountpoint}/hub.pub`,
        TOKEN_FILE: `${agentMountVolume.mountpoint}/universal-token`,
        HUB_URL: localHubUrl,
        ...(agentConfig.primarySensor
          ? { PRIMARY_SENSOR: agentConfig.primarySensor }
          : {}),
      },
      onStdout: forwardAgentLog('stdout', universalToken),
      onStderr: forwardAgentLog('stderr', universalToken),
    },
    ready: {
      display: i18n('Local Agent'),
      gracePeriod: 30_000,
      fn: async () => {
        const check = await agentSubcontainer.exec(
          ['/agent', 'health'],
          { env: { LISTEN: String(agentPort) } },
          5_000,
        )
        return check.exitCode === 0
          ? {
              result: 'success' as const,
              message: i18n('The local agent is running'),
            }
          : {
              result: 'failure' as const,
              message: i18n(
                'The local agent is not running. Check the service logs for registration errors.',
              ),
            }
      },
    },
    requires: [serviceName],
  })
})
