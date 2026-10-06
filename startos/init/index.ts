import { sdk } from '../sdk'
import { dependencies } from '../dependencies'
import { setInterfaces } from '../interfaces'
import { versionGraph } from '../versions'
import { restoreInit } from '../backups'
import { actions } from '../actions'
import { primaryUrlTask, seedHubConfig } from './hubConfig'
import { setupLocalAgent } from './localAgent'

export const init = sdk.setupInit(
  restoreInit,
  versionGraph,
  seedHubConfig,
  setInterfaces,
  actions,
  primaryUrlTask,
  dependencies,
  setupLocalAgent,
)

export const uninit = sdk.setupUninit(versionGraph)
