import { VersionInfo, IMPOSSIBLE } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.18.7:1',
  releaseNotes: {
    en_US: `Improved the StartOS package integration for Beszel 0.18.7.

- Migrated the package to Start SDK 2.0.9.
- Aligned the package structure and build tooling with current StartOS packaging conventions.
- Added the Beszel 0.18.7 upstream source as a pinned git submodule.
- Improved package metadata, localization, and type safety.
- No change to the upstream Beszel Hub or Agent version.`,
    es_ES: `Mejorada la integración del paquete de StartOS para Beszel 0.18.7.

- Migrado el paquete a Start SDK 2.0.9.
- Alineada la estructura del paquete y las herramientas de compilación con las convenciones actuales de empaquetado de StartOS.
- Añadido el código fuente upstream de Beszel 0.18.7 como submódulo git fijado a esa versión.
- Mejorados los metadatos del paquete, la localización y la seguridad de tipos.
- Sin cambios en la versión upstream de Beszel Hub o Agent.`,
  },
  migrations: {
    up: async () => {},
    down: IMPOSSIBLE,
  },
})
