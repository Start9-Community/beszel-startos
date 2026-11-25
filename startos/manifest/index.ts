import { setupManifest } from '@start9labs/start-sdk'
import { long, short } from './i18n'

export const manifest = setupManifest({
  id: 'beszel',
  title: 'Beszel',
  license: 'MIT',
  packageRepo: 'https://github.com/Start9-Community/beszel-startos',
  upstreamRepo: 'https://github.com/henrygd/beszel',
  marketingUrl: 'https://beszel.dev',
  donationUrl: null,
  description: { short, long },
  volumes: ['main', 'agent'],
  images: {
    beszel: {
      source: {
        dockerBuild: {
          buildArgs: {
            IMAGE:
              'henrygd/beszel:0.21.2@sha256:b0be90bd4aee2993fde763032a5098ce4386fba43cfe5031ec017b8d9e8c97a2',
          },
        },
      },
      arch: ['x86_64', 'aarch64'],
    },
    'beszel-agent': {
      source: {
        dockerBuild: {
          buildArgs: {
            IMAGE:
              'henrygd/beszel-agent:0.21.2@sha256:343254226ae57a5cc6f8c23c755b1464730aba2abc7043116a2e222711ec6e1a',
          },
        },
      },
      arch: ['x86_64', 'aarch64'],
    },
  },
})
