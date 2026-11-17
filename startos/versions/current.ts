import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.21.2:0',
  releaseNotes: {
    en_US: `Updated Beszel to 0.21.2.

**Features**

- TLS certificate expiry checks and alerts for HTTPS network monitors, and an option to ignore TLS errors
- Network monitor comparison across systems, and a choice of DNS server for DNS monitors
- Pending package updates, systemd service logs, Wi-Fi signal strength and CPU socket count for remote agents that report them
- Paginated tables, an actions menu with alert settings on each system, and styled HTML alert emails

**Security**

- Sign-in attempts are limited to 10 per minute per address
- Fixes users and agents being able to change records belonging to other users or systems
- Agent tokens stay masked until you reveal them

**Fixes**

- Many fixes to disk, ZFS, NVMe, GPU and network statistics, agent reconnection, and alerts

[Full release notes](https://github.com/henrygd/beszel/releases)`,
    es_ES: `Beszel actualizado a 0.21.2.

**Funciones**

- Comprobaciones y alertas de caducidad de certificados TLS en los monitores de red HTTPS, y una opción para ignorar errores TLS
- Comparación de monitores de red entre sistemas, y elección del servidor DNS en los monitores DNS
- Actualizaciones de paquetes pendientes, registros de servicios systemd, intensidad de señal Wi-Fi y número de sockets de CPU en los agentes remotos que los reportan
- Tablas paginadas, un menú de acciones con ajustes de alertas en cada sistema y correos de alerta en HTML con formato

**Seguridad**

- Los intentos de inicio de sesión se limitan a 10 por minuto por dirección
- Corrige que usuarios y agentes pudieran modificar registros de otros usuarios o sistemas
- Los tokens de agente permanecen ocultos hasta que los muestres

**Correcciones**

- Numerosas correcciones en las estadísticas de discos, ZFS, NVMe, GPU y red, en la reconexión de agentes y en las alertas

[Notas de la versión completas](https://github.com/henrygd/beszel/releases)`,
    de_DE: `Beszel auf 0.21.2 aktualisiert.

**Funktionen**

- Prüfung und Warnungen zum Ablauf von TLS-Zertifikaten bei HTTPS-Netzwerkmonitoren sowie eine Option, TLS-Fehler zu ignorieren
- Vergleich von Netzwerkmonitoren über Systeme hinweg und Wahl des DNS-Servers für DNS-Monitore
- Ausstehende Paketaktualisierungen, systemd-Dienstprotokolle, WLAN-Signalstärke und Anzahl der CPU-Sockel für entfernte Agenten, die diese melden
- Tabellen mit Seitenumbruch, ein Aktionsmenü mit Warnungseinstellungen für jedes System und formatierte HTML-Warnungs-E-Mails

**Sicherheit**

- Anmeldeversuche sind auf 10 pro Minute und Adresse begrenzt
- Behebt, dass Benutzer und Agenten Datensätze anderer Benutzer oder Systeme ändern konnten
- Agenten-Tokens bleiben verborgen, bis Sie sie einblenden

**Fehlerbehebungen**

- Zahlreiche Korrekturen an Festplatten-, ZFS-, NVMe-, GPU- und Netzwerkstatistiken, an der Wiederverbindung von Agenten und an Warnungen

[Vollständige Versionshinweise](https://github.com/henrygd/beszel/releases)`,
    pl_PL: `Zaktualizowano Beszel do wersji 0.21.2.

**Funkcje**

- Sprawdzanie i alerty wygaśnięcia certyfikatów TLS w monitorach sieci HTTPS oraz opcja ignorowania błędów TLS
- Porównywanie monitorów sieci między systemami oraz wybór serwera DNS dla monitorów DNS
- Oczekujące aktualizacje pakietów, logi usług systemd, siła sygnału Wi-Fi i liczba gniazd CPU dla zdalnych agentów, które je raportują
- Tabele z podziałem na strony, menu akcji z ustawieniami alertów dla każdego systemu oraz sformatowane e-maile z alertami w HTML

**Bezpieczeństwo**

- Próby logowania są ograniczone do 10 na minutę na adres
- Naprawiono możliwość zmiany przez użytkowników i agentów rekordów należących do innych użytkowników lub systemów
- Tokeny agentów pozostają ukryte, dopóki ich nie odsłonisz

**Poprawki**

- Wiele poprawek statystyk dysków, ZFS, NVMe, GPU i sieci, ponownego łączenia agentów oraz alertów

[Pełne informacje o wydaniu](https://github.com/henrygd/beszel/releases)`,
    fr_FR: `Beszel mis à jour vers 0.21.2.

**Fonctionnalités**

- Vérification et alertes d'expiration des certificats TLS pour les moniteurs réseau HTTPS, et option pour ignorer les erreurs TLS
- Comparaison des moniteurs réseau entre systèmes, et choix du serveur DNS pour les moniteurs DNS
- Mises à jour de paquets en attente, journaux des services systemd, force du signal Wi-Fi et nombre de sockets CPU pour les agents distants qui les remontent
- Tableaux paginés, un menu d'actions avec les réglages d'alerte sur chaque système et des e-mails d'alerte HTML mis en forme

**Sécurité**

- Les tentatives de connexion sont limitées à 10 par minute et par adresse
- Corrige la possibilité pour des utilisateurs et des agents de modifier des enregistrements appartenant à d'autres utilisateurs ou systèmes
- Les jetons d'agent restent masqués tant que vous ne les révélez pas

**Corrections**

- De nombreuses corrections des statistiques de disque, ZFS, NVMe, GPU et réseau, de la reconnexion des agents et des alertes

[Notes de version complètes](https://github.com/henrygd/beszel/releases)`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
