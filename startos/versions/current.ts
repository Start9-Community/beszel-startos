import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.18.7:1',
  releaseNotes: {
    en_US: 'Initial release on the Start9 Community Registry.',
    es_ES: 'Versión inicial en el Registro de la Comunidad Start9.',
    de_DE: 'Erste Veröffentlichung im Start9 Community Registry.',
    pl_PL: 'Pierwsze wydanie w rejestrze społeczności Start9.',
    fr_FR: 'Première version sur le registre communautaire Start9.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
