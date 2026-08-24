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
      source: { dockerTag: 'henrygd/beszel:0.18.7' },
      arch: ['x86_64', 'aarch64'],
    },
    'beszel-agent': {
      source: { dockerTag: 'henrygd/beszel-agent:0.18.7' },
      arch: ['x86_64', 'aarch64'],
    },
  },
  dependencies: {},
})
