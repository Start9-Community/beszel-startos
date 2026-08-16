import { sdk } from './sdk'
import {
  agentConfigJson,
  hubPublicKeyFile,
  universalTokenFile,
} from './fileModels/agentConfig'
import {
  hubConfigDefaults,
  hubConfigJson,
} from './fileModels/hubConfig'
import { i18n } from './i18n'
import {
  agentMountVolume,
  agentPort,
  discoverCanonicalHubUrl,
  httpPort,
  localHubUrl,
  log,
  mountVolume,
  serviceName,
  subcontainerName,
} from './utils'

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
  const storedHubConfig = await hubConfigJson.read().const(effects)
  const hubConfig = storedHubConfig ?? { ...hubConfigDefaults }

  const primaryUrl =
    hubConfig.primaryUrl.trim() ||
    (await discoverCanonicalHubUrl(effects))

  if (!primaryUrl) {
    throw new Error(
      'No non-local Beszel Web UI URL is available for APP_URL. Enable a Web UI address in StartOS or configure the Hub.',
    )
  }

  const heartbeatUrl = hubConfig.heartbeatUrl.trim()
  const heartbeatEnabled = Boolean(heartbeatUrl)

  const hubEnv: Record<string, string> = {
    APP_URL: primaryUrl,
  }

  if (heartbeatEnabled) {
    hubEnv.HEARTBEAT_URL = heartbeatUrl
    hubEnv.HEARTBEAT_INTERVAL = String(hubConfig.heartbeatInterval)
    hubEnv.HEARTBEAT_METHOD = hubConfig.heartbeatMethod
  }

  const agentConfig = await agentConfigJson.read().const(effects)
  const hubPublicKey = await hubPublicKeyFile.read().const(effects)
  const universalToken = await universalTokenFile.read().const(effects)

  log('Setting up main service', {
    serviceName,
    httpPort,
    appUrl: primaryUrl,
    heartbeatEnabled,
    ...(heartbeatEnabled
      ? {
          heartbeatInterval: hubConfig.heartbeatInterval,
          heartbeatMethod: hubConfig.heartbeatMethod,
        }
      : {}),
    mountpoint: mountVolume.mountpoint,
  })

  const mounts = sdk.Mounts.of().mountVolume(mountVolume)
  log('Mount configuration created', mountVolume)

  const subcontainer = await sdk.SubContainer.of(
    effects,
    { imageId: serviceName },
    mounts,
    subcontainerName,
  )
  log('Subcontainer created', {
    imageId: serviceName,
    subcontainerName,
    rootfs: subcontainer.rootfs,
  })

  // The beszel Docker image is FROM scratch — it has no /etc/passwd or /etc/group.
  // start-container subcontainer exec requires these files to resolve the user,
  // so we write minimal entries before the daemon spawns commands.
  await subcontainer.writeFile('/etc/passwd', 'root:x:0:0:root:/root:/bin/sh\n')
  await subcontainer.writeFile('/etc/group', 'root:x:0:\n')
  log('Wrote minimal account files for scratch image')

  log('Registering Beszel daemon', {
    daemon: serviceName,
    command: 'image entrypoint',
    appUrl: primaryUrl,
    heartbeatEnabled,
    ...(heartbeatEnabled
      ? {
          heartbeatInterval: hubConfig.heartbeatInterval,
          heartbeatMethod: hubConfig.heartbeatMethod,
        }
      : {}),
  })

  let hubHealthCheckAttempt = 0

  const daemons = sdk.Daemons.of(effects).addDaemon(serviceName, {
    subcontainer,
    exec: {
      command: sdk.useEntrypoint(),
      env: hubEnv,
    },
    ready: {
      display: 'Web Interface',
      fn: async () => {
        hubHealthCheckAttempt += 1
        log('Running Hub readiness check', {
          attempt: hubHealthCheckAttempt,
          url: `http://127.0.0.1:${httpPort}`,
        })

        const result = await sdk.healthCheck.checkWebUrl(
          effects,
          `http://127.0.0.1:${httpPort}`,
          {
            timeout: 60_000,
            successMessage: 'Beszel is ready',
            errorMessage:
              'Beszel is still starting. If this persists, please check the logs.',
          },
        )
        log('Hub health check result', {
          attempt: hubHealthCheckAttempt,
          result,
        })
        return result
      },
    },
    requires: [],
  })

  if (agentConfig?.enabled && hubPublicKey?.trim() && universalToken?.trim()) {
    const agentMounts = sdk.Mounts.of().mountVolume(agentMountVolume)
    const agentSubcontainer = await sdk.SubContainer.of(
      effects,
      { imageId: 'beszel-agent' },
      agentMounts,
      'beszel-agent',
    )

    await agentSubcontainer.writeFile(
      '/etc/passwd',
      'root:x:0:0:root:/root:/bin/sh\n',
    )
    await agentSubcontainer.writeFile('/etc/group', 'root:x:0:\n')

    log('Registering local agent daemon', {
      listen: agentPort,
      hubUrl: localHubUrl,
      systemName: agentConfig.systemName,
      primarySensor: agentConfig.primarySensor || 'automatic',
      keyConfigured: true,
      tokenConfigured: true,
    })

    log('Main service setup complete', {
      daemons: [serviceName, 'local-agent'],
    })
    let agentHealthCheckAttempt = 0
    return daemons.addDaemon('local-agent', {
      subcontainer: agentSubcontainer,
      exec: {
        command: sdk.useEntrypoint(),
        env: {
          LISTEN: String(agentPort),
          SYSTEM_NAME: agentConfig.systemName,
          KEY_FILE: '/var/lib/beszel-agent/hub.pub',
          TOKEN_FILE: '/var/lib/beszel-agent/universal-token',
          HUB_URL: localHubUrl,
          ...(agentConfig.primarySensor
            ? { PRIMARY_SENSOR: agentConfig.primarySensor }
            : {}),
        },
        onStdout: forwardAgentLog('stdout', universalToken.trim()),
        onStderr: forwardAgentLog('stderr', universalToken.trim()),
      },
      ready: {
        display: i18n('Local Agent'),
        gracePeriod: 30_000,
        fn: async () => {
          agentHealthCheckAttempt += 1
          const check = await agentSubcontainer.exec(
            ['/agent', 'health'],
            { env: { LISTEN: String(agentPort) } },
            5_000,
          )
          const output = `${check.stdout.toString()} ${check.stderr.toString()}`.trim()
          const result =
            check.exitCode === 0
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
          log('Local agent native health check result', {
            attempt: agentHealthCheckAttempt,
            exitCode: check.exitCode,
            exitSignal: check.exitSignal,
            output,
            result,
          })
          return result
        },
      },
      requires: [serviceName],
    })
  }

  log('Main service setup complete', { daemons: [serviceName] })
  return daemons
})
