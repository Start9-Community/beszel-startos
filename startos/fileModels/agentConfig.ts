import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

const agentVolume = sdk.volumes.agent

const shape = z.object({
  enabled: z.boolean().catch(false),
  systemName: z.string().catch('StartOS'),
  primarySensor: z.string().catch(''),
})

export const agentConfigJson = FileHelper.json(
  { base: agentVolume, subpath: './config.json' },
  shape,
)

export const hubPublicKeyFile = FileHelper.string({
  base: agentVolume,
  subpath: './hub.pub',
})

export const universalTokenFile = FileHelper.string({
  base: agentVolume,
  subpath: './universal-token',
})
