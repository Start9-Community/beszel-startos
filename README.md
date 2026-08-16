# Beszel for StartOS

This repository packages [Beszel](https://github.com/henrygd/beszel) for StartOS. It currently pins the Hub and Agent images to `0.18.7` for `x86_64` and `aarch64`.

StartOS package versions follow `<beszel-version>:<package-revision>`. A new Beszel version starts at revision `0`, and StartOS-only updates increment the revision, such as `0.18.7:1`, `0.18.7:2`, and `0.18.7:3`.

## Quick start (StartOS)

Install Beszel from the start9.tabordalab.com (TabordaLab StartOS registry), or sideload the `.s9pk` package.

<img width="1879" height="911" alt="image" src="https://github.com/user-attachments/assets/30075831-ee6c-4096-8a0e-f5a437a8108f" />

## Package architecture

- `beszel` runs the upstream Hub on port 8090 and persists `/beszel_data` in the `main` volume.
- The optional `local-agent` daemon runs the matching upstream agent image and persists `/var/lib/beszel-agent` in the `agent` volume.
- The packaged local agent connects directly to the Hub at `http://127.0.0.1:8090`, so local registration does not depend on the configured public Hub URL, TLS trust, or the StartOS reverse proxy/WebSocket path.
- Hub data and agent state are both included in StartOS backups.

The **Configure Local Agent** StartOS action implements Beszel's supported universal-token registration flow. It stores the public key in `hub.pub`, the token in a mode-0600 `universal-token` file, and non-secret settings in `config.json`. Runtime configuration uses `KEY_FILE` and `TOKEN_FILE`; the token is not embedded in the package, emitted in package logs, passed on the agent command line/environment, or returned when the configuration form is reopened.

The action is prompted as an important task on fresh install rather than a critical task. This is intentional: the Hub must start so the user can create the first normal account and obtain a permanent universal token from **Settings > Tokens**. Beszel 0.18.7 rejects universal-token API use by PocketBase superusers, and its authenticated API does not provide a safe unauthenticated bootstrap mechanism. The package does not store Beszel login credentials or modify PocketBase tables.

## Registration and identity

`SYSTEM_NAME` defaults to `StartOS` and is configurable. The optional primary temperature sensor is passed to the agent as `PRIMARY_SENSOR`; leave it blank to use Beszel's automatic selection. Beszel creates a system when the enabled agent first connects with an active universal token. The persistent agent fingerprint prevents duplication across ordinary restarts and updates as long as the configured token is retained.

Beszel associates fingerprint records with the token used during registration. Changing the agent token after registration can therefore create a duplicate system even when the fingerprint is unchanged. The action warns about this behavior. Fingerprint deletion/reset is not automated.

## Host visibility limitation

The StartOS SDK's package mount API exposes only package volumes, assets, backups, and declared dependency volumes. It does not expose arbitrary host paths, the host root filesystem, `/var/run/docker.sock`, or a containerd socket. Consequently, the packaged agent monitors the resource view available inside the service's isolated runtime and cannot enumerate other StartOS services. Full host metrics and Docker/container statistics are not claimed by this integration.

The local-agent readiness check verifies that its listener is running. Registration/authentication failures remain visible in the upstream agent logs without the package printing credential values; an end-to-end online-state check is not possible without storing a Beszel user session.

## Development

```sh
npm run check
npm run build
make
```

`make` creates architecture-specific `.s9pk` files using the workspace's `start-cli` configuration.
