import { sdk } from '../sdk'
import { setDependencies } from '../dependencies'
import { setInterfaces } from '../interfaces'
import { versionGraph } from '../versions'
import { restoreInit } from '../backups'
import { actions } from '../actions'
import { setupHubConfig } from './hubConfig'
import { setupLocalAgent } from './localAgent'

export const init = sdk.setupInit(
  restoreInit,
  versionGraph,
  setInterfaces,
  setDependencies,
  actions,
  setupHubConfig,
  setupLocalAgent,
)

export const uninit = sdk.setupUninit(versionGraph)
