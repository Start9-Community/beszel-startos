import { configureLocalAgent } from '../actions/configureLocalAgent'
import { agentConfigJson } from '../fileModels/agentConfig'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

export const setupLocalAgent = sdk.setupOnInit(async (effects, kind) => {
  await agentConfigJson.merge(effects, {})

  if (kind === 'install') {
    await sdk.action.createOwnTask(effects, configureLocalAgent, 'important', {
      reason: i18n(
        'After creating your Beszel account, configure the local agent to register this package automatically.',
      ),
    })
  }
})
