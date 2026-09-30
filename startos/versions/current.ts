import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.18.8:0',
  releaseNotes: {
    en_US:
      'Update hub and agent to Beszel 0.18.8: battery and fan monitoring, more reliable agent reconnections, and the hub public key in token settings. Pin both images by digest.',
    es_ES:
      'Actualiza el hub y el agente a Beszel 0.18.8: monitoreo de baterías y ventiladores, reconexiones más fiables y la clave pública del hub en la configuración de tokens. Fija ambas imágenes por digest.',
    de_DE:
      'Hub und Agent auf Beszel 0.18.8 aktualisiert: Batterie- und Lüfterüberwachung, zuverlässigere Agent-Verbindungen und der öffentliche Hub-Schlüssel in den Token-Einstellungen. Beide Images sind per Digest fixiert.',
    pl_PL:
      'Aktualizacja huba i agenta do Beszel 0.18.8: monitorowanie baterii i wentylatorów, niezawodniejsze ponowne połączenia agenta oraz klucz publiczny huba w ustawieniach tokenów. Oba obrazy przypięto do digestów.',
    fr_FR:
      'Mise à jour du hub et de l’agent vers Beszel 0.18.8 : suivi des batteries et ventilateurs, reconnexions plus fiables et clé publique du hub dans les paramètres des jetons. Les deux images sont fixées par digest.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
