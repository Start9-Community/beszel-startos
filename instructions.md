# Beszel

## Documentation

- [Getting started](https://beszel.dev/guide/getting-started) — the upstream tour of the dashboard, systems, and alerts.
- [Agent installation](https://beszel.dev/guide/agent-installation) — how to install Beszel's agent on the machines you want to monitor, including universal tokens.
- [Notifications](https://beszel.dev/guide/notifications) — configuring alerts and where they're delivered.
- [Common issues](https://beszel.dev/guide/common-issues) — upstream troubleshooting.

## What you get on StartOS

Beszel exposes a **Web UI** interface: the dashboard where you add machines, watch their metrics, and set up alerts.

This package includes Beszel `0.19.0` for both the hub and the bundled agent. This release adds ZFS monitoring and additional alerts on supported machines, with fixes for agent metrics and hub reliability.

You also get an optional **local agent** — a second process, alongside the dashboard, that monitors this StartOS server. It is off until you configure it; turning it on is the last section of [Getting set up](#getting-set-up).

Machines you actually want to monitor — your laptop, a VPS, another server — run Beszel's own agent installed on them directly, exactly as the upstream guide describes. Nothing about that changes here.

## Getting set up

1. Open the **Web UI** interface and create your Beszel account. Use a normal account, not a PocketBase superuser — a superuser cannot issue the token the next steps need.
2. Add the machines you want to monitor, following Beszel's own instructions. For each, Beszel gives you an install command to run on that machine.

That is the whole setup for monitoring other machines. The rest is only needed if you want Beszel to also report on this service.

### Setting the address Beszel advertises

Beszel puts an address into the links it generates and the agent install commands it shows you. StartOS picks one for you from the addresses you've published for the Web UI interface, preferring a public one.

If those links point somewhere you don't want, run **Configure Hub** and choose a different address. The dropdown lists exactly what's currently published — if it's empty, publish an address for the Web UI interface first.

The same action offers an optional **Heartbeat URL**: an endpoint Beszel calls on a schedule so an external monitor can tell it's alive. Leave it blank unless you have one.

### Connecting remote agents over HTTPS

Agents from `0.19.0` onward verify the hub's HTTPS certificate. If your chosen Web UI address uses a StartOS certificate or another private certificate authority, copy that authority's PEM certificate to each remote agent and set `CA_CERT_FILE` to its path. For a container agent, mount the certificate into the container and use the container path. Restart the remote agent after changing its configuration.

The bundled local agent connects internally over HTTP and needs no certificate configuration.

### Enabling the local agent

1. In Beszel, go to **Settings → Tokens**, enable the universal token, and set it to **Permanent**. Copy it.
2. Copy the hub's SSH public key from the same **Settings → Tokens** screen.
3. Run **Configure Local Agent**. Turn it on, give it a system name, and paste in the public key and the token. Optionally name a temperature sensor — for example `coretemp_package_id_0` — to pick which reading shows in the systems table; leave it blank and Beszel chooses.
4. Save. Beszel restarts, the agent connects, and the system appears in your systems table on its own.

Don't add this system with **Add System** first — the agent creates it. If a system with the same name is already there by hand, rename or remove it before you enable the agent.

Reopening the action never shows you the saved token. Leave that field blank to keep it; type a new one only when you actually mean to change it.

> **Keep the token you registered with.** Beszel links a machine's identity to the token used when it registered, so replacing the agent's token afterwards can create a _second_ copy of the same system. If you do want to move the agent to a different token, delete the old system in Beszel first.

If the system never appears, check this service's Logs tab — a wrong token or public key is reported there. Your token is never written to the logs.

## Limitations

**The local agent can't break its figures down per service.** Its CPU, memory, swap, and disk readings report server totals, but Beszel's Docker-statistics panel stays empty because a StartOS service can't reach the container runtime. Container health alerts are unavailable for the same reason. Uptime depends on what the service's runtime exposes.

Systemd failure alerts and full ZFS monitoring need an agent installed on the monitored host with access to the required services, devices, and utilities.
