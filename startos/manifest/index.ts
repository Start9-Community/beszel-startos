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
          'henrygd/beszel:0.19.0@sha256:fefb27166f5e1611ebf67f8697ea928a23f44efdb00af922e2ac3b5faa2efd5c',
      },
      arch: ['x86_64', 'aarch64'],
    },
    'beszel-agent': {
      source: {
        dockerTag:
          'henrygd/beszel-agent:0.19.0@sha256:00c88600e7d120128f623b2deb5257603d464e841fd68f88cc791dcc075f9e46',
      },
      arch: ['x86_64', 'aarch64'],
    },
  },
  dependencies: {},
})
