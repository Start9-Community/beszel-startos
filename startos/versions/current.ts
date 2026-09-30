import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.20.0:0',
  releaseNotes: {
    en_US:
      'Update hub and agent to Beszel 0.20.0: network monitors, Btrfs reporting, saved view preferences, and connection and certificate fixes. Host monitoring features depend on agent access. Remote agents using a private HTTPS CA still require CA_CERT_FILE.',
    es_ES:
      'Actualiza el hub y el agente a Beszel 0.20.0: monitores de red, información Btrfs, preferencias de vista guardadas y correcciones de conexión y certificados. El monitoreo del host depende del acceso del agente. Los agentes remotos con una CA HTTPS privada siguen necesitando CA_CERT_FILE.',
    de_DE:
      'Hub und Agent auf Beszel 0.20.0 aktualisiert: Netzwerkmonitore, Btrfs-Daten, gespeicherte Ansichten sowie Verbindungs- und Zertifikatskorrekturen. Host-Überwachung hängt vom Zugriff des Agenten ab. Entfernte Agenten mit privater HTTPS-CA benötigen weiterhin CA_CERT_FILE.',
    pl_PL:
      'Aktualizacja huba i agenta do Beszel 0.20.0: monitory sieci, dane Btrfs, zapisane preferencje widoku oraz poprawki połączeń i certyfikatów. Monitorowanie hosta zależy od dostępu agenta. Zdalne agenty z prywatnym CA HTTPS nadal wymagają CA_CERT_FILE.',
    fr_FR:
      'Mise à jour du hub et de l’agent vers Beszel 0.20.0 : moniteurs réseau, données Btrfs, préférences de vue enregistrées et corrections des connexions et certificats. Le suivi de l’hôte dépend des accès de l’agent. Les agents distants utilisant une autorité HTTPS privée nécessitent toujours CA_CERT_FILE.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
