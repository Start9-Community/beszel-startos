<p align="center">
  <img src="icon.svg" alt="Beszel Logo" width="21%" />
</p>

# Beszel on StartOS

> Everything not listed in this document should behave the same as upstream
> Beszel. If a feature, setting, or behavior is not mentioned here, the
> upstream documentation is accurate and fully applicable — see the
> Documentation section of `instructions.md` for links.

[Beszel](https://github.com/henrygd/beszel) is a lightweight server monitoring hub: a web dashboard that collects metrics from agents running on the machines you want to watch. This package runs the hub, and optionally an agent alongside it that monitors the StartOS server itself.

- **Upstream repo:** <https://github.com/henrygd/beszel>
- **Wrapper repo:** <https://github.com/Start9-Community/beszel-startos>

---

## Table of Contents

- [Image and Container Runtime](#image-and-container-runtime)
- [Volume and Data Layout](#volume-and-data-layout)
- [File Models](#file-models)
- [Dependencies](#dependencies)
- [Network Access and Interfaces](#network-access-and-interfaces)
- [Installation and First-Run Flow](#installation-and-first-run-flow)
- [Actions](#actions)
- [Tasks](#tasks)
- [Health Checks](#health-checks)
- [Backups and Restore](#backups-and-restore)
- [Limitations and Differences](#limitations-and-differences)
- [Quick Reference for AI Consumers](#quick-reference-for-ai-consumers)

---

## Image and Container Runtime

Two upstream images, unmodified, each running its own entrypoint.

| Property      | Value                                    |
| ------------- | ---------------------------------------- |
| Images        | `henrygd/beszel`, `henrygd/beszel-agent` |
| Architectures | x86_64, aarch64                          |
| Command       | `sdk.useEntrypoint()` for both           |

| Subcontainer   | Purpose                                                  |
| -------------- | -------------------------------------------------------- |
| `beszel`       | The hub daemon — the one to `attach` to                  |
| `beszel-agent` | The optional `local-agent` daemon; absent unless enabled |

**Both images are `FROM scratch`** — a single static Go binary plus a CA bundle, with no shell, no `/etc/passwd`, and no `/etc/group`. Subcontainer exec resolves a user against those files, so `main.ts` writes a minimal pair into each subcontainer before the daemon spawns. This is also why the agent's health check execs `/agent health` directly rather than going through a shell: there is no shell to go through.

## Volume and Data Layout

Two volumes, deliberately separate so the agent's identity survives independently of the hub's database.

| Volume  | Mount Point             | Contents                                                                      |
| ------- | ----------------------- | ----------------------------------------------------------------------------- |
| `main`  | `/beszel_data`          | The hub's PocketBase database — accounts, systems, historical metrics, alerts |
| `agent` | `/var/lib/beszel-agent` | `config.json`, `hub.pub`, `universal-token`, and the agent's own fingerprint  |

The mount points are fixed by the images: `/beszel_data` is the hub's declared `VOLUME`, and the agent reads its credentials from the paths given in `KEY_FILE`/`TOKEN_FILE`.

## File Models

Four models, all StartOS-side state. Beszel's own configuration is held in its PocketBase database, which this package neither reads nor writes; everything the package controls reaches the hub as an environment variable at launch.

| Model                | File                                       | Seeded by                 | Rewritten by              |
| -------------------- | ------------------------------------------ | ------------------------- | ------------------------- |
| `hubConfigJson`      | `/beszel_data/startos-wrapper-config.json` | `merge({})` at init       | **Configure Hub**         |
| `agentConfigJson`    | `/var/lib/beszel-agent/config.json`        | `merge({})` at init       | **Configure Local Agent** |
| `hubPublicKeyFile`   | `/var/lib/beszel-agent/hub.pub`            | **Configure Local Agent** | **Configure Local Agent** |
| `universalTokenFile` | `/var/lib/beszel-agent/universal-token`    | **Configure Local Agent** | **Configure Local Agent** |

Nothing is re-asserted behind the user's back — the two actions are the only writers, and each `merge({})` at init only fills a key that is missing. A hand edit survives and takes effect, because `main.ts` reads all four reactively: a change restarts the affected daemon.

`universal-token` is written mode 0600 and is the one secret the package holds. It is passed to the agent as a _file path_, never as an argument or an environment value, is redacted out of the agent's forwarded stdout/stderr, and is never returned when the action's form is reopened — leaving that field blank keeps the stored value.

## Dependencies

None.

## Network Access and Interfaces

One interface, serving the dashboard and Beszel's own API on the same port.

| Interface | Id       | Type | Port | Description                                                         |
| --------- | -------- | ---- | ---- | ------------------------------------------------------------------- |
| Web UI    | `web-ui` | ui   | 8090 | Dashboard for viewing system metrics and managing monitored systems |

The agent listens on 45876 but is **not** exported, because the only client is the hub in the same service, reached over loopback at `http://127.0.0.1:8090`. That is deliberate: local registration then does not depend on the published hub URL, on TLS trust, or on the StartOS reverse proxy.

## Installation and First-Run Flow

Two things must happen in order, and the second cannot be automated.

**The hub needs a non-local address before it will start.** Beszel bakes `APP_URL` into the links it generates and the install commands it shows for remote agents, so the package resolves it from the Web UI interface's published addresses — preferring a public one, then any non-local one. A server with no LAN, Tor, or domain address published for that interface has nothing to resolve, and `main.ts` throws rather than starting the hub on a URL that would send users nowhere. **Configure Hub** pins a specific choice if the automatic one is wrong.

**The local agent has to be configured by hand, after an account exists.** Beszel issues a universal token only to a signed-in normal user (0.18.7 rejects universal-token API use by a PocketBase superuser), and offers no unauthenticated bootstrap. So the package cannot register itself at install time: the user creates an account in Beszel's own UI, copies a token and the hub's public key out of it, and pastes them into **Configure Local Agent**. This is why that task is `important` rather than `critical` — a `critical` task would block the hub from starting, and the hub has to be running to produce the token that clears it.

## Actions

Two, both user-facing.

### Configure Hub

Run it when the address Beszel advertises is wrong — generated links point somewhere unreachable, or a remote agent's install command names the wrong host. It writes `startos-wrapper-config.json` and restarts the hub, a few seconds' interruption. Idempotent.

The Primary URL field offers only addresses StartOS currently publishes for the Web UI interface, and the save is rejected if the chosen one is no longer among them. An empty dropdown therefore means no address is published for that interface — not a package fault.

The optional heartbeat calls an external endpoint on an interval; it is off unless a URL is given, and the URL is stored verbatim rather than reduced to an origin, since these endpoints carry a path.

### Configure Local Agent

Run it once after creating a Beszel account, and again only to change the system name, the sensor, or the credentials. It writes the three files in the `agent` volume and restarts the service; enabling it adds the `local-agent` daemon, disabling it removes the daemon on the next start.

**Repeating it with a _new_ token is the one unsafe case.** Beszel ties a fingerprint record to the token used at registration, so changing the token after a successful registration can create a second system for the same machine even though the fingerprint is unchanged. Remove the old system in Beszel first if that is the intent. Re-running with the token field blank keeps the stored token and is safe.

Validation happens at save time: with the agent enabled, a missing key, token, or system name is rejected, as is a public key that is not in OpenSSH `authorized_keys` form.

**What the registered system actually reports is the host, not the container.** The agent runs in its own subcontainer, but StartOS does not mask `/proc`, so CPU, memory, swap, load average and uptime come through as the server's own — and the agent's filesystem stats resolve to the partition its rootfs overlays, which is the one holding package data. Measured against a running server: the agent reported 31.2 GB memory total and 1839 GB disk with 1240 GB used, against a host reading 31.2 GB and 1839 GB / 1241 GB. Only the per-service breakdown is missing, for the reason in [Limitations](#limitations-and-differences).

## Tasks

Two, both `important`, so neither blocks the service from starting.

| Task                          | Raised when                                                                               | Cleared by                                             |
| ----------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| Choose the primary Beszel URL | The stored Primary URL is unset, or is not among the currently published Web UI addresses | **Configure Hub** saving a currently-published address |
| Configure the local agent     | Install only                                                                              | **Configure Local Agent** saving                       |

The hub-URL task can return: removing or replacing the address it names raises it again on the next init pass. The local-agent task is raised on install and not again — a later `init` does not re-raise it, so a user who dismisses it and then wants the agent runs the action from the Actions list directly.

## Health Checks

Two, the second present only when the local agent is enabled.

| Check         | Displayed       | Method                                                                    |
| ------------- | --------------- | ------------------------------------------------------------------------- |
| `beszel`      | "Web Interface" | HTTP GET against the hub on loopback                                      |
| `local-agent` | "Local Agent"   | `/agent health` inside the agent's subcontainer, after a 30s grace period |

A hub check that stays red past the first few seconds means the process is failing, not warming up — the service log carries the reason, and the usual one is an `APP_URL` the hub rejected.

The agent check answers "is the listener running", **not** "is it registered with the hub" — an end-to-end registration check would require the package to hold a Beszel user session, which it deliberately does not. The two failure modes therefore look different:

- **A malformed public key** makes the agent exit at startup, so the row shows the supervisor's own `local-agent daemon crashed` rather than this package's message, and the agent's parse error repeats in the service log on each retry.
- **A bad or revoked token** lets the agent run, so the row goes **green** while no system ever appears in Beszel's systems table. That combination is the tell.

Either way the agent's own output is forwarded into the service log with the stored token filtered out, so the log is safe to share.

## Backups and Restore

Both volumes are copied wholesale — `sdk.Backups.ofVolumes('main', 'agent')`. Nothing is dumped or excluded, so a restore brings back the hub's accounts, systems, and full metric history, along with the agent's credentials and fingerprint.

Because the fingerprint is inside the backup, a restored agent re-registers as the _same_ system rather than creating a duplicate. That is the reason for the separate `agent` volume, and the reason deleting it to resolve a registration conflict is a bad idea: the agent comes back as a new machine.

## Limitations and Differences

1. **The local agent reports no per-service breakdown.** A StartOS package cannot mount a container runtime socket, so Beszel's Docker-statistics feature has nothing to read: `container_stats` stays empty, and the systems table shows one aggregate figure per resource rather than a row per service. Everything else it reports is genuine host data — see [Health Checks](#health-checks).
2. **Registration cannot be automated.** The universal token has to be copied out of Beszel's UI by hand, because Beszel issues one only to an authenticated normal user.
3. **The hub will not start without a published non-local address** for its Web UI interface.

---

## Quick Reference for AI Consumers

```yaml
package_id: beszel
image: henrygd/beszel # plus henrygd/beszel-agent for the optional local agent
architectures:
  - x86_64
  - aarch64
subcontainers:
  - beszel # the hub
  - beszel-agent # only when the local agent is enabled
volumes:
  main: /beszel_data
  agent: /var/lib/beszel-agent
file_models:
  - /beszel_data/startos-wrapper-config.json
  - /var/lib/beszel-agent/config.json
  - /var/lib/beszel-agent/hub.pub
  - /var/lib/beszel-agent/universal-token
startos_managed_env_vars:
  - APP_URL
  - HEARTBEAT_URL
  - HEARTBEAT_INTERVAL
  - HEARTBEAT_METHOD
  - LISTEN
  - SYSTEM_NAME
  - KEY_FILE
  - TOKEN_FILE
  - HUB_URL
  - PRIMARY_SENSOR
dependencies: none
interfaces:
  web-ui: { type: ui, port: 8090 }
actions:
  - set-hub-config
  - configure-local-agent
tasks:
  - { action: set-hub-config, severity: important }
  - { action: configure-local-agent, severity: important }
health_checks:
  - beszel # displayed "Web Interface"
  - local-agent # displayed "Local Agent"; only when enabled
```
