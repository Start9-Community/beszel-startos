# Beszel

Beszel is a lightweight monitoring hub with historical metrics and alerts.

## First-time setup

1. Start Beszel and open **Web UI** from the service's **Interfaces** tab.
2. Create the first normal Beszel user account. Do not use a PocketBase superuser for the local-agent token.
3. In Beszel, open **Settings > Tokens**, enable the universal token, and select **Permanent**.
4. Copy the universal token.
5. Copy the Hub SSH public key shown by Beszel in its agent setup UI.
6. In StartOS, run **Actions > Configure Local Agent**.
7. Enable the agent, enter a system name (the default is `StartOS`), paste the public key and token, and save. Optionally set **Primary Temperature Sensor** to the exact Beszel sensor name, such as `coretemp_package_id_0`.

The agent connects directly to the packaged Hub and creates the system automatically. Do not create it first with **Add System**. If a manually created system already uses the same name, rename or remove that entry before enabling the local agent.

## Token and identity behavior

The universal token is entered through a masked field, stored in a mode-0600 file in the agent's persistent package volume, and passed to the agent through that file rather than a command-line argument or environment variable. It is included in StartOS backups. The agent fingerprint is stored in the same volume, so restarts, package updates, and restores retain its identity.

The saved token is never returned when reopening the action. Leave the token field blank to retain it; enter a new value only when intentionally changing registration credentials.

After the first successful registration, keep the token configured on this agent even if you disable or rotate the Hub's universal token. Replacing the agent's token can cause Beszel to create another system for the same fingerprint. To intentionally move the agent to a different Hub or token, remove the old Beszel system first, then update the action. Resetting the fingerprint is deliberately not automated.

An invalid token, wrong public key, or unavailable Hub is reported in the service logs. The package never logs the configured token.

## Monitoring limitation on StartOS

StartOS packages cannot mount arbitrary host paths. In particular, this package cannot mount the host's Docker/containerd socket or host root filesystem through the supported SDK. The local agent therefore reports only metrics visible from the Beszel service's isolated runtime. It does not enumerate other StartOS services/containers, and host storage or network values may be incomplete. Full host monitoring requires a separately managed host-level agent until StartOS exposes a supported host-metrics or runtime-socket interface.

## Backups

Backups include both Hub data and local-agent state, including its fingerprint and configuration. Do not delete the agent volume to resolve a registration conflict unless you intentionally want a new identity.
