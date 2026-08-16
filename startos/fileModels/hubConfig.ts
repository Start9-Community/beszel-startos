import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

const mainVolume = sdk.volumes.main

export const heartbeatMethods = ['POST', 'GET', 'HEAD'] as const

export const hubConfigDefaults = {
  primaryUrl: '',
  heartbeatUrl: '',
  heartbeatInterval: 60,
  heartbeatMethod: 'POST' as const,
}

const shape = z.object({
  primaryUrl: z.string().catch(hubConfigDefaults.primaryUrl),
  heartbeatUrl: z.string().catch(hubConfigDefaults.heartbeatUrl),
  heartbeatInterval: z
    .number()
    .int()
    .positive()
    .catch(hubConfigDefaults.heartbeatInterval),
  heartbeatMethod: z
    .enum(heartbeatMethods)
    .catch(hubConfigDefaults.heartbeatMethod),
})

export type HubConfig = z.infer<typeof shape>

export const hubConfigJson = FileHelper.json(
  {
    base: mainVolume,
    subpath: './startos-wrapper-config.json',
  },
  shape,
)
