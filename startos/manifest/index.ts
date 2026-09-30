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
          'henrygd/beszel:0.18.8@sha256:4c51486968efa0b0a702c1b0967966a2e06fb250b7418f3072d2488faea27c51',
      },
      arch: ['x86_64', 'aarch64'],
    },
    'beszel-agent': {
      source: {
        dockerTag:
          'henrygd/beszel-agent:0.18.8@sha256:3b1939746690e423072b4a99bf4c4af6dd9562a68978a33738a3c4a4cc000c39',
      },
      arch: ['x86_64', 'aarch64'],
    },
  },
  dependencies: {},
})
