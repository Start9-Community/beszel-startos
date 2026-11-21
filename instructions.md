# Beszel

## Documentation

- [Getting started](https://beszel.dev/guide/getting-started) — the upstream tour of the dashboard, systems, and alerts.
- [Agent installation](https://beszel.dev/guide/agent-installation) — how to install Beszel's agent on the machines you want to monitor, including universal tokens.
- [Notifications](https://beszel.dev/guide/notifications) — configuring alerts and where they're delivered.
- [Common issues](https://beszel.dev/guide/common-issues) — upstream troubleshooting.

## What you get on StartOS

Beszel exposes a **Web UI** interface: the dashboard where you add machines, watch their metrics, and set up alerts.

This package includes Beszel `0.21.2` for both the hub and the bundled agent.

You also get an optional **local agent** — a second process, alongside the dashboard, that monitors this StartOS server. It is off until you configure it; turning it on is the last section of [Getting set up](#getting-set-up).

Machines you actually want to monitor — your laptop, a VPS, another server — run Beszel's own agent installed on them directly, exactly as the upstream guide describes. Nothing about that changes here.

## Getting set up

1. Open the **Web UI** interface and create your Beszel account. Use a normal account, not a PocketBase superuser — a superuser cannot issue the token the next steps need.
2. Add the machines you want to monitor, following Beszel's own instructions. For each, Beszel gives you an install command to run on that machine.

That is the whole setup for monitoring other machines. The rest is only needed if you want Beszel to also report on this service.

**Sign-in rate limit:** Clients using the same StartOS proxy share a limit of 10 sign-in attempts per minute. If Beszel reports too many requests, pause sign-in attempts for a minute before trying again. Repeated attempts by one person can affect others; existing authenticated sessions and agent connections keep working.

### Setting the address Beszel advertises

Beszel puts an address into the links it generates and the agent install commands it shows you. After install, StartOS asks you to run **Set Primary URL** and choose it. The form preselects a public domain if you have one, HTTPS first, and otherwise this server's `.local` address. Until you choose, and whenever the address you chose is unavailable, Beszel uses that preselected address. Opening the Web UI from StartOS goes to the address you chose.

If those links point somewhere you don't want, run **Set Primary URL** again and choose a different address. The dropdown lists exactly what's currently published — if it's empty, publish an address for the Web UI interface first.

**Configure Heartbeat** sets an optional **Heartbeat URL**: an endpoint Beszel calls on a schedule so an external monitor can tell it's alive. Leave it blank unless you have one.

### Connecting remote agents over HTTPS

Agents from `0.19.0` onward verify the hub's HTTPS certificate. If your chosen Web UI address uses a StartOS certificate or another private certificate authority, copy that authority's PEM certificate to each remote agent and set `CA_CERT_FILE` to its path. For a container agent, mount the certificate into the container and use the container path. Restart the remote agent after changing its configuration.

The bundled local agent connects to this service's hub internally and needs no certificate configuration. Pointed at a hub elsewhere, it takes the certificate in its own settings; see [Reporting to a hub elsewhere](#reporting-to-a-hub-elsewhere).

### Enabling the local agent

1. In Beszel, go to **Settings → Tokens**, enable the universal token, and set it to **Permanent**. Copy it.
2. Copy the hub's SSH public key from the same **Settings → Tokens** screen.
3. Run **Configure Local Agent**. Turn it on, give it a system name, and paste in the public key and the token. Optionally name a temperature sensor — for example `coretemp_package_id_0` — to pick which reading shows in the systems table; leave it blank and Beszel chooses.
4. Save. Beszel restarts, the agent connects, and the system appears in your systems table on its own.

Don't add this system with **Add System** first — the agent creates it. If a system with the same name is already there by hand, rename or remove it before you enable the agent.

Reopening the action never shows you the saved token. Leave that field blank to keep it; type a new one only when you actually mean to change it.

> **Keep the token you registered with.** Beszel links a machine's identity to the token used when it registered, so replacing the agent's token afterwards can create a _second_ copy of the same system. If you do want to move the agent to a different token, delete the old system in Beszel first.

If the system never appears, check this service's Logs tab — a wrong token or public key is reported there. Your token is never written to the logs.

### Reporting to a hub elsewhere

If you already run Beszel somewhere else, the local agent can report this server to that hub instead of the one in this service.

1. In the other hub, copy its universal token and public key from **Settings → Tokens**, as above.
2. Run **Configure Local Agent**, turn it on, and set **External Hub URL** to the address you open that hub at, for example `https://beszel.example.com`. Paste in that hub's public key and token.
3. If that hub's HTTPS certificate comes from a private certificate authority — another StartOS server's, for example — paste the authority's PEM certificate into **External Hub CA Certificate**. Leave it blank for a hub with a publicly trusted certificate.
4. Save. The system appears in the other hub's systems table.

This service's own dashboard keeps running either way; you can simply not use it. Clear **External Hub URL** to report to it again. Moving the agent from one hub to another leaves its old system behind in the first, where you can delete it.

### Network monitoring

Configure network monitors in the Beszel dashboard and select the agent that should run them. HTTP, TCP, and DNS targets must be reachable from that agent. ICMP availability depends on its operating system permissions and has not been verified for the bundled StartOS agent.

HTTPS monitors require the target certificate to be trusted by the agent's system CA bundle. The remote-agent `CA_CERT_FILE` setting described above applies only to its connection to the Beszel hub.

## Limitations

**The local agent's network chart shows only its own traffic.** It can see its own network connection, not the server's, so traffic carried by other services, backups, or the server's gateways does not appear there.

**The local agent can't break its figures down per service.** Its CPU, memory, swap, and disk readings report server totals, but Beszel's Docker-statistics panel stays empty because a StartOS service can't reach the container runtime. Container health alerts and image-update indicators are unavailable for the same reason. Uptime depends on what the service's runtime exposes.

Systemd failure alerts and full ZFS monitoring need an agent installed on the monitored host with access to the required services, devices, and utilities.

Btrfs storage reporting depends on which mount and filesystem information the agent can access. Complete storage-pool visibility from the bundled agent has not been verified on StartOS.
