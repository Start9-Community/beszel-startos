# AGENTS.md

This is a StartOS service-package repository — it builds a `.s9pk` for StartOS.

Develop it inside a StartOS packaging workspace created by `start-cli s9pk init-workspace`,
which provides the packaging guide and agent context one level up. If you're reading this in a
bare clone with no workspace, the full guide is at <https://docs.start9.com/packaging>.

**Start every task at the recipe index** — `../start-technologies/projects/start-sdk/docs/src/recipes.md`
(or <https://docs.start9.com/packaging/recipes.html>). It maps an intent ("prompt the user to create
admin credentials", "expose a web UI") to the constructs, the reference pages, and a named production
package to copy. Find the recipe before you read this package's neighbours: a package you reach by
grepping may be non-conformant, and the recipe outranks it.

Work this package's `TODO.md` from top to bottom. Keep `README.md` (technical reference for an AI support or administering agent) and `instructions.md` (end-user docs) in sync with your changes.

## This repo

- **Both upstream images are `FROM scratch`** — a single static Go binary plus a CA bundle, and nothing else. No shell, no `/etc/passwd`, no `/etc/group`. `main.ts` writes minimal account files into each subcontainer before the daemon spawns, because subcontainer exec has to resolve a user; without them the daemon never starts. Anything you add that shells out (`sh -c …`, a health check that pipes) will fail here — exec the binary directly, as the agent health check does.
- **The default branch is `main`, and the CI workflows say `main`.** Keep those in step: a workflow pointed at a branch the repo doesn't use silently never runs.
- **The hub's `APP_URL` must be a non-local address**, and Beszel bakes it into the links it generates and the install commands it shows for remote agents. It is resolved from the exported Web UI interface, so a server with no LAN/Tor/domain address published for that interface cannot start the hub.
