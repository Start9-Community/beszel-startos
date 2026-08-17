# TODO — Beszel

## Pending

- [ ] Exercise **Configure Local Agent** end-to-end: create a Beszel account, copy the hub
      public key and a universal token out of Beszel's own UI, enable the agent, and confirm
      the system appears in the hub's systems table and reports metrics.
- [ ] Confirm what the local agent actually measures. It runs in its own subcontainer, so
      CPU/memory/disk figures describe that container's view rather than the StartOS host —
      document whichever it turns out to be, in `README.md` § Limitations and Differences.
- [ ] Exercise the optional heartbeat: point **Configure Hub**'s Heartbeat URL at a real
      endpoint and confirm requests arrive at the configured interval and method.
- [ ] Backup and restore, confirming the `main` volume (PocketBase database, accounts,
      historical metrics) and the `agent` volume (hub key, universal token, agent settings)
      both come back and the agent re-registers without re-entering credentials.
