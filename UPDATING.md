# Updating the upstream version

This package wraps two prebuilt Docker Hub images: `henrygd/beszel` (the hub) and `henrygd/beszel-agent` (the agent). They are released together and must use the same version, with each image pinned to its own multi-architecture manifest digest. No upstream source checkout or submodule is required.

## Determining the upstream version

- Latest tags:

  ```sh
  curl -s "https://hub.docker.com/v2/repositories/henrygd/beszel/tags?page_size=25" | jq -r '.results[].name'
  ```

- Confirm both images publish the tag for `amd64` and `arm64`:

  ```sh
  for img in henrygd/beszel henrygd/beszel-agent; do
    docker manifest inspect "$img:<tag>" | jq -r '.manifests[].platform.architecture'
  done
  ```

- Release notes: <https://github.com/henrygd/beszel/releases>

The current pins live in `startos/manifest/index.ts` at `images.beszel.source.dockerTag` and `images['beszel-agent'].source.dockerTag`.

## Applying the bump

1. Review the release notes for changes to agent connections, data paths, and required configuration. Verify each image's multi-architecture manifest digest with `docker buildx imagetools inspect <image>:<tag>`.
2. Set both `dockerTag` values to `<image>:<tag>@sha256:<digest>` using each image's own digest. Drop the leading `v` from the release tag.
3. Bump `startos/versions/current.ts` to `<new version>:0` and write its release notes in all five locales. Increment the revision only for later packaging changes to that upstream version.
4. Keep a previous version in `startos/versions/` only if its `up` migration performs work. Beszel applies its own database migrations when the hub starts.
5. Update `README.md` and `instructions.md`, run the TypeScript and SDK checks, and commit the release changes before building both architectures so the packages identify a clean Git commit.
6. Verify the hub's web interface, existing-account login, and fresh metrics from the same registered agent after upgrading. Test installation and backup/restore on StartOS before publication; a local container test or package build does not establish native acceptance.
