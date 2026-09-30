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
        dockerTag:
          'henrygd/beszel:0.20.0@sha256:897e807a065adf8e89e30ae0cd79d1f5e38fe84ccaffbc418bde9d3cdca4eacc',
      },
      arch: ['x86_64', 'aarch64'],
    },
    'beszel-agent': {
      source: {
        dockerTag:
          'henrygd/beszel-agent:0.20.0@sha256:765e3d4a087c4bcbf6b78ed0f1dfdcd669c4bf6ad5789a832d2944603ae7fd08',
      },
      arch: ['x86_64', 'aarch64'],
    },
  },
  dependencies: {},
})
