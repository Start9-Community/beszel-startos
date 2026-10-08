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

Two upstream images, unmodified, each running its own entrypoint. Both use Beszel `0.20.0`, pinned to immutable multi-architecture image digests in `startos/manifest/index.ts`. The StartOS package version is `0.20.0:1`.

The package does not build upstream source and requires no `upstream-project` checkout or Git submodule. Its license and icon are regular files included in this repository.

| Property      | Value                                    |
| ------------- | ---------------------------------------- |
| Images        | `henrygd/beszel`, `henrygd/beszel-agent` |
| Architectures | x86_64, aarch64                          |
| Command       | `sdk.useEntrypoint()` for both           |

| Subcontainer   | Purpose                                                  |
| -------------- | -------------------------------------------------------- |
| `beszel`       | The hub daemon — the one to `attach` to                  |
| `beszel-agent` | The optional `local-agent` daemon; absent unless enabled |

**Both images are `FROM scratch`**, with a static Go binary, a public CA bundle, no shell, no `/etc/passwd`, and no `/etc/group`. Subcontainer exec resolves a user against the account files, so `main.ts` writes a minimal pair into each subcontainer before the daemon spawns. The agent's health check execs `/agent health` directly because the image has no shell.

## Volume and Data Layout

Two volumes, deliberately separate so the agent's identity survives independently of the hub's database.

| Volume  | Mount Point             | Contents                                                                      |
| ------- | ----------------------- | ----------------------------------------------------------------------------- |
| `main`  | `/beszel_data`          | The hub's PocketBase database — accounts, systems, historical metrics, alerts |
| `agent` | `/var/lib/beszel-agent` | `config.json`, `hub.pub`, `universal-token`, and the agent's own fingerprint  |

The mount points are fixed by the images: `/beszel_data` is the hub's declared `VOLUME`, and the agent reads its credentials from the paths given in `KEY_FILE`/`TOKEN_FILE`.

## File Models

Four models, all StartOS-side state. Beszel's own configuration is held in its PocketBase database, which this package neither reads nor writes; everything the package controls reaches the hub as an environment variable at launch.

| Model                | File                                       | Seeded by                 | Rewritten by                                 |
| -------------------- | ------------------------------------------ | ------------------------- | -------------------------------------------- |
| `hubConfigJson`      | `/beszel_data/startos-wrapper-config.json` | `merge({})` at init       | **Set Primary URL**, **Configure Heartbeat** |
| `agentConfigJson`    | `/var/lib/beszel-agent/config.json`        | `merge({})` at init       | **Configure Local Agent**                    |
| `hubPublicKeyFile`   | `/var/lib/beszel-agent/hub.pub`            | **Configure Local Agent** | **Configure Local Agent**                    |
| `universalTokenFile` | `/var/lib/beszel-agent/universal-token`    | **Configure Local Agent** | **Configure Local Agent**                    |

Nothing is re-asserted behind the user's back — the three actions are the only writers, and each `merge({})` at init only fills a key that is missing. A hand edit survives and takes effect, because `main.ts` reads all four reactively: a change restarts the affected daemon.

`universal-token` is written mode 0600 and is the one secret the package holds. It is passed to the agent as a _file path_, never as an argument or an environment value, is redacted out of the agent's forwarded stdout/stderr, and is never returned when the action's form is reopened — leaving that field blank keeps the stored value.

## Dependencies

None.

## Network Access and Interfaces

One interface, serving the dashboard and Beszel's own API on the same port.

| Interface | Id       | Type | Port | Description                                                         |
| --------- | -------- | ---- | ---- | ------------------------------------------------------------------- |
| Web UI    | `web-ui` | ui   | 8090 | Dashboard for viewing system metrics and managing monitored systems |

**Open UI** opens the address that `bestUsable` resolves for the Primary URL (`preferredLauncherAddress`), the same one Beszel advertises.

The agent listens on 45876 but is **not** exported, because the only client is the hub in the same service, reached over loopback at `http://127.0.0.1:8090`. That is deliberate: local registration then does not depend on the published hub URL, on TLS trust, or on the StartOS reverse proxy.

Starting with agent `0.19.0`, remote agents verify the hub's HTTPS certificate. If the published address uses a StartOS or other private CA, provide its PEM certificate to each remote agent through `CA_CERT_FILE`, using a path readable inside that agent's runtime. The bundled agent uses local HTTP and needs no additional CA configuration.

Beszel `0.20.0` adds agent-based HTTP, TCP, DNS, and ICMP network monitors, configured in the dashboard. Probes originate from the selected agent, so their targets must be reachable from that agent. HTTPS probes use the image's system CA bundle; `CA_CERT_FILE` configures the agent's hub connection, not network-monitor trust. The wrapper does not enable upstream trusted-header authentication, so `TRUSTED_PROXY_IPS` needs no package setting.

## Installation and First-Run Flow

Two things must happen in order, and the second cannot be automated.

**The hub needs a non-local address before it will start.** Beszel bakes `APP_URL` into the links it generates and the install commands it shows for remote agents. The package passes `sdk.setupPrimaryUrl`'s `bestUsable` (`startos/primaryUrl.ts`): the address stored by **Set Primary URL**, followed to its hostname's current port and scheme; while nothing is stored or that hostname is gone, the preferred address — a public domain, HTTPS first, then the `.local` address, then the first one offered. The stored choice is never overwritten by the fallback, so a chosen address that comes back is used again. A server with no LAN, Tor, or domain address published for the Web UI interface has nothing to resolve, and `main.ts` throws rather than starting the hub on a URL that would send users nowhere.

**The local agent has to be configured by hand, after an account exists.** Beszel issues a universal token only to a signed-in normal user (0.18.7 rejects universal-token API use by a PocketBase superuser), and offers no unauthenticated bootstrap. So the package cannot register itself at install time: the user creates an account in Beszel's own UI, copies a token and the hub's public key out of it, and pastes them into **Configure Local Agent**. This is why that task is `important` rather than `critical` — a `critical` task would block the hub from starting, and the hub has to be running to produce the token that clears it.

## Actions

Three, all user-facing.

### Set Primary URL

Id `set-hub-config`. Run it when the address Beszel advertises is wrong — generated links point somewhere unreachable, or a remote agent's install command names the wrong host. It stores the choice as `primaryUrl` in `startos-wrapper-config.json` and restarts the hub, a few seconds' interruption. Idempotent.

The Primary URL field offers the Web UI interface's non-local addresses (loopback, link-local and the container bridge are left out) and preselects the preferred one. An empty dropdown means no address is published for that interface — not a package fault.

### Configure Heartbeat

Id `set-heartbeat`. The optional heartbeat calls an external endpoint on an interval; it is off unless a URL is given, and the URL is stored verbatim rather than reduced to an origin, since these endpoints carry a path. Saving restarts the hub.

### Configure Local Agent

Run it once after creating a Beszel account, and again only to change the system name, the sensor, or the credentials. It writes the three files in the `agent` volume and restarts the service; enabling it adds the `local-agent` daemon, disabling it removes the daemon on the next start.

**Repeating it with a _new_ token is the one unsafe case.** Beszel ties a fingerprint record to the token used at registration, so changing the token after a successful registration can create a second system for the same machine even though the fingerprint is unchanged. Remove the old system in Beszel first if that is the intent. Re-running with the token field blank keeps the stored token and is safe.

Validation happens at save time: with the agent enabled, a missing key, token, or system name is rejected, as is a public key that is not in OpenSSH `authorized_keys` form.

**The local agent can report host resource totals from its subcontainer.** Earlier StartOS validation found that CPU, memory, swap, and load average reflected the server, while filesystem stats resolved to the partition holding package data. Those measurements predate this upgrade. Uptime and host integrations depend on the runtime's exposed files, namespaces, devices, and utilities; see [Limitations](#limitations-and-differences).

## Tasks

Two, both `important`, so neither blocks the service from starting.

| Task                          | Raised when                                                                                    | Cleared by                                                               |
| ----------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Choose the primary Beszel URL | The stored Primary URL is unset, or its hostname is not among the Web UI interface's addresses | **Set Primary URL** saving one of them, or the stored hostname returning |
| Configure the local agent     | Install only                                                                                   | **Configure Local Agent** saving                                         |

The hub-URL task can return: removing the address it names raises it again, and it is raised even while the interface has no addresses, so publish a Web UI address before completing it. The local-agent task is raised on install and not again — a later `init` does not re-raise it, so a user who dismisses it and then wants the agent runs the action from the Actions list directly.

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

1. **The local agent reports no per-service breakdown.** A StartOS package cannot mount a container runtime socket, so Beszel's Docker-statistics feature has nothing to read: `container_stats` stays empty, and the systems table shows aggregate figures. Container health alerts and image-update indicators also require that socket. Linux uptime now comes from `/proc/uptime`; its meaning depends on the runtime's time namespace.
2. **Registration cannot be automated.** The universal token has to be copied out of Beszel's UI by hand, because Beszel issues one only to an authenticated normal user.
3. **The hub will not start without a published non-local address** for its Web UI interface.
4. **Host integrations require access to their data.** The bundled scratch agent has no systemd service manager or ZFS utilities. Use an agent installed on the monitored host for systemd failure alerts and full ZFS monitoring.
5. **Storage pool visibility depends on the runtime.** Btrfs reporting uses visible mount and sysfs information; complete host pool visibility from the bundled agent requires native verification.
6. **ICMP depends on socket permissions.** The scratch agent has no `ping` executable as a fallback. Native StartOS ICMP monitoring requires verification; the package adds no raw-socket privileges.

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
  - set-hub-config # Set Primary URL
  - set-heartbeat # Configure Heartbeat
  - configure-local-agent
tasks:
  - { action: set-hub-config, severity: important }
  - { action: configure-local-agent, severity: important }
health_checks:
  - beszel # displayed "Web Interface"
  - local-agent # displayed "Local Agent"; only when enabled
```
