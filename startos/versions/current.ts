import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.21.2:2',
  releaseNotes: {
    en_US:
      'Updates Beszel to 0.21.2. The local agent can report this server to a Beszel hub you already run elsewhere: set **External Hub URL** in **Configure Local Agent**, and paste a CA certificate if that hub uses a private certificate authority. Published in the Community Registry.',
    es_ES:
      'Actualiza Beszel a 0.21.2. El agente local puede informar de este servidor a un hub de Beszel que ya tenga en otro lugar: establezca **URL del Hub externo** en **Configurar agente local** y pegue un certificado de CA si ese hub usa una autoridad de certificación privada. Publicado en el Community Registry.',
    de_DE:
      'Aktualisiert Beszel auf 0.21.2. Der lokale Agent kann diesen Server an einen Beszel-Hub melden, den du bereits anderswo betreibst: Setze **Externe Hub-URL** in **Lokalen Agenten konfigurieren** und füge ein CA-Zertifikat ein, falls dieser Hub eine private Zertifizierungsstelle verwendet. Veröffentlicht in der Community Registry.',
    pl_PL:
      'Aktualizuje Beszel do 0.21.2. Agent lokalny może raportować ten serwer do hubu Beszel, który już działa gdzie indziej: ustaw **Adres URL zewnętrznego Hub** w **Skonfiguruj agenta lokalnego** i wklej certyfikat CA, jeśli ten hub używa prywatnego urzędu certyfikacji. Publikowany w Community Registry.',
    fr_FR:
      "Met à jour Beszel vers 0.21.2. L'agent local peut rendre compte de ce serveur à un hub Beszel que vous exécutez déjà ailleurs : définissez **URL du Hub externe** dans **Configurer l'agent local**, et collez un certificat CA si ce hub utilise une autorité de certification privée. Publié dans le Community Registry.",
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
