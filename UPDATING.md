# Updating the upstream version

This package wraps two prebuilt Docker Hub images — `henrygd/beszel` (the hub) and `henrygd/beszel-agent` (the agent). They are released together and must be pinned to the same tag.

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

1. Set both `dockerTag` values to the new tag (drop the leading `v` from the release tag).
2. Bump `startos/versions/current.ts` to `<new version>:1` and write its release notes in all five locales.
3. Rebuild, install, and verify the hub's web interface comes up, an existing account still logs in, and — if the local agent is configured — its system still reports metrics.
