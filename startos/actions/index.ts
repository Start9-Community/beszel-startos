import { primaryUrl } from '../primaryUrl'
import { sdk } from '../sdk'
import { configureLocalAgent } from './configureLocalAgent'
import { setHeartbeat } from './setHeartbeat'

export const actions = sdk.Actions.of()
  .addAction(primaryUrl.action)
  .addAction(setHeartbeat)
  .addAction(configureLocalAgent)
