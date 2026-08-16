import { sdk } from '../sdk'
import { configureLocalAgent } from './configureLocalAgent'
import { setHubConfig } from './setHubConfig'

export const actions = sdk.Actions.of()
  .addAction(setHubConfig)
  .addAction(configureLocalAgent)
