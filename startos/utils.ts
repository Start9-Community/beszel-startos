export const serviceName = 'beszel'
export const subcontainerName = 'beszel'
export const webInterfaceId = 'web-ui'
export const webMultiHostId = 'web-multi'
export const httpPort = 8090
export const agentPort = 45876

export const localHubUrl = `http://127.0.0.1:${httpPort}`

// Both mountpoints are fixed by the upstream images: /beszel_data is the hub's
// declared VOLUME, and the agent's KEY_FILE/TOKEN_FILE are written under the other.
export const mountVolume = {
  volumeId: 'main',
  subpath: null,
  mountpoint: '/beszel_data',
  readonly: false,
} as const

export const agentMountVolume = {
  volumeId: 'agent',
  subpath: null,
  mountpoint: '/var/lib/beszel-agent',
  readonly: false,
} as const
