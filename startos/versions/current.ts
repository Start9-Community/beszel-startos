import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.20.0:1',
  releaseNotes: {
    en_US:
      'Update hub and agent to Beszel 0.20.0: network monitors, Btrfs reporting, saved view preferences, and connection and certificate fixes. Host monitoring features depend on agent access. Remote agents using a private HTTPS CA still require CA_CERT_FILE.\n\n- The address Beszel puts in its links and remote-agent install commands is chosen with Set Primary URL. Until one is chosen, or while the chosen address is unavailable, Beszel uses a public domain if there is one, HTTPS first.\n- The heartbeat settings are in Configure Heartbeat, whose Heartbeat Method field explains what each option sends.\n- Opening the Web UI from StartOS goes to the primary URL.',
    es_ES:
      'Actualiza el hub y el agente a Beszel 0.20.0: monitores de red, información Btrfs, preferencias de vista guardadas y correcciones de conexión y certificados. El monitoreo del host depende del acceso del agente. Los agentes remotos con una CA HTTPS privada siguen necesitando CA_CERT_FILE.\n\n- La dirección que Beszel incluye en sus enlaces y en los comandos de instalación de agentes remotos se elige con Establecer URL principal. Hasta que se elija una, o mientras la elegida no esté disponible, Beszel usa un dominio público si lo hay, primero HTTPS.\n- Los ajustes de heartbeat están en Configurar heartbeat, cuyo campo Método de heartbeat explica qué envía cada opción.\n- Al abrir la interfaz web desde StartOS se va a la URL principal.',
    de_DE:
      'Hub und Agent auf Beszel 0.20.0 aktualisiert: Netzwerkmonitore, Btrfs-Daten, gespeicherte Ansichten sowie Verbindungs- und Zertifikatskorrekturen. Host-Überwachung hängt vom Zugriff des Agenten ab. Entfernte Agenten mit privater HTTPS-CA benötigen weiterhin CA_CERT_FILE.\n\n- Die Adresse, die Beszel in seine Links und in die Installationsbefehle für entfernte Agenten einsetzt, wird mit „Primäre URL festlegen“ gewählt. Bis eine gewählt ist oder solange die gewählte nicht verfügbar ist, verwendet Beszel eine öffentliche Domain, falls vorhanden, HTTPS zuerst.\n- Die Heartbeat-Einstellungen befinden sich in „Heartbeat konfigurieren“; dort erklärt das Feld „Heartbeat-Methode“, was jede Option sendet.\n- Wird die Weboberfläche aus StartOS geöffnet, führt sie zur primären URL.',
    pl_PL:
      'Aktualizacja huba i agenta do Beszel 0.20.0: monitory sieci, dane Btrfs, zapisane preferencje widoku oraz poprawki połączeń i certyfikatów. Monitorowanie hosta zależy od dostępu agenta. Zdalne agenty z prywatnym CA HTTPS nadal wymagają CA_CERT_FILE.\n\n- Adres, który Beszel umieszcza w swoich linkach i w poleceniach instalacji zdalnych agentów, wybiera się w „Ustaw główny adres URL”. Dopóki nie zostanie wybrany lub gdy wybrany jest niedostępny, Beszel używa domeny publicznej, jeśli taka istnieje, najpierw HTTPS.\n- Ustawienia heartbeat znajdują się w „Skonfiguruj heartbeat”, gdzie pole „Metoda heartbeat” wyjaśnia, co wysyła każda opcja.\n- Otwarcie interfejsu webowego ze StartOS prowadzi do głównego adresu URL.',
    fr_FR:
      'Mise à jour du hub et de l’agent vers Beszel 0.20.0 : moniteurs réseau, données Btrfs, préférences de vue enregistrées et corrections des connexions et certificats. Le suivi de l’hôte dépend des accès de l’agent. Les agents distants utilisant une autorité HTTPS privée nécessitent toujours CA_CERT_FILE.\n\n- L’adresse que Beszel place dans ses liens et dans les commandes d’installation des agents distants se choisit avec « Définir l’URL principale ». Tant qu’aucune n’est choisie, ou si celle choisie n’est pas disponible, Beszel utilise un domaine public s’il y en a un, HTTPS d’abord.\n- Les paramètres du heartbeat se trouvent dans « Configurer le heartbeat », dont le champ « Méthode de heartbeat » explique ce que chaque option envoie.\n- Ouvrir l’interface web depuis StartOS mène à l’URL principale.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
