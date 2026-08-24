import { type T } from '@start9labs/start-sdk'
import { sdk } from './sdk'

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

function normalizedHostname(hostname: string): string {
  return hostname.toLowerCase().replace(/\.$/, '')
}

function isLoopbackHostname(hostname: string): boolean {
  const normalized = normalizedHostname(hostname)

  return (
    normalized === 'localhost' ||
    normalized === '::1' ||
    normalized === '[::1]' ||
    /^127\./.test(normalized)
  )
}

function isIpv4Hostname(hostname: string): boolean {
  return /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)
}

function canonicalUrlPriority(value: string): number {
  const url = new URL(value)
  const hostname = normalizedHostname(url.hostname)

  if (
    !hostname.endsWith('.onion') &&
    !hostname.endsWith('.local') &&
    !isIpv4Hostname(hostname) &&
    !hostname.includes(':')
  ) {
    return 0
  }

  if (hostname.endsWith('.onion')) return 1
  if (hostname.endsWith('.local')) return 2
  if (isIpv4Hostname(hostname)) return 3

  return 4
}

function compareCanonicalUrls(left: string, right: string): number {
  const priorityDifference =
    canonicalUrlPriority(left) - canonicalUrlPriority(right)

  if (priorityDifference !== 0) return priorityDifference

  const leftProtocol = new URL(left).protocol === 'https:' ? 0 : 1
  const rightProtocol = new URL(right).protocol === 'https:' ? 0 : 1

  return leftProtocol - rightProtocol || left.localeCompare(right)
}

export function normalizeOrigin(value: string): string | null {
  const trimmed = value.trim()
  if (!trimmed) return null

  try {
    const url = new URL(trimmed)

    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return null
    }

    return url.origin
  } catch {
    return null
  }
}

function normalizeOrigins(values: string[]): string[] {
  return Array.from(
    new Set(
      values
        .map(normalizeOrigin)
        .filter((value): value is string => value !== null)
        .filter((value) => !isLoopbackHostname(new URL(value).hostname)),
    ),
  )
}

export function selectCanonicalBase(urls: string[]): string {
  return normalizeOrigins(urls).sort(compareCanonicalUrls)[0] ?? ''
}

export function getWebUiInterfaceUrls(effects: T.Effects): Promise<string[]> {
  return sdk.host
    .getOwn(effects, webMultiHostId, (host) => {
      const addresses = Object.values(host?.bindings ?? {})
        .flatMap((binding) => Object.values(binding.interfaces))
        .find((iface) => iface.id === webInterfaceId)?.addressInfo
      if (!addresses) return []
      return normalizeOrigins(addresses.nonLocal.format()).sort(
        compareCanonicalUrls,
      )
    })
    .const()
}

export function discoverCanonicalHubUrl(effects: T.Effects): Promise<string> {
  return sdk.host
    .getOwn(effects, webMultiHostId, (host) => {
      const addresses = Object.values(host?.bindings ?? {})
        .flatMap((binding) => Object.values(binding.interfaces))
        .find((iface) => iface.id === webInterfaceId)?.addressInfo
      if (!addresses) return ''
      return (
        selectCanonicalBase(addresses.public.format()) ||
        selectCanonicalBase(addresses.nonLocal.format())
      )
    })
    .const()
}
