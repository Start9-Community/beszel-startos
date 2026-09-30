import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.19.0:0',
  releaseNotes: {
    en_US:
      'Update hub and agent to Beszel 0.19.0: ZFS monitoring, additional alerts, and reliability fixes. Remote agents now verify HTTPS certificates; configure CA_CERT_FILE for a private CA. The bundled agent continues using local HTTP.',
    es_ES:
      'Actualiza el hub y el agente a Beszel 0.19.0: monitoreo ZFS, nuevas alertas y mejoras de fiabilidad. Los agentes remotos ahora verifican los certificados HTTPS; configura CA_CERT_FILE para una CA privada. El agente incluido sigue usando HTTP local.',
    de_DE:
      'Hub und Agent auf Beszel 0.19.0 aktualisiert: ZFS-Überwachung, zusätzliche Alarme und Zuverlässigkeitskorrekturen. Entfernte Agenten prüfen jetzt HTTPS-Zertifikate; für eine private CA ist CA_CERT_FILE erforderlich. Der integrierte Agent nutzt weiterhin lokales HTTP.',
    pl_PL:
      'Aktualizacja huba i agenta do Beszel 0.19.0: monitorowanie ZFS, dodatkowe alerty i poprawki niezawodności. Zdalne agenty weryfikują teraz certyfikaty HTTPS; dla prywatnego CA ustaw CA_CERT_FILE. Wbudowany agent nadal używa lokalnego HTTP.',
    fr_FR:
      'Mise à jour du hub et de l’agent vers Beszel 0.19.0 : suivi ZFS, alertes supplémentaires et corrections de fiabilité. Les agents distants vérifient désormais les certificats HTTPS ; configurez CA_CERT_FILE pour une autorité privée. L’agent intégré utilise toujours HTTP en local.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
