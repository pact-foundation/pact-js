# Releasing

Releases are automated with [Release Please](https://github.com/googleapis/release-please)
and are driven entirely by pull requests. There is no manual release trigger.

## How a release works

1. Commits land on `master` following the [Conventional Commits](https://www.conventionalcommits.org)
   guidelines in `CONTRIBUTING.md`.
2. The `release.yml` workflow runs on every push to `master` and maintains a
   **release PR** titled something like `chore(master): release 17.2.0`. That PR
   contains the version bump in `package.json`, the updated `CHANGELOG.md` and
   the updated `.release-please-manifest.json`. It is kept up to date as more
   commits land.
3. **Merging the release PR is the release.** On merge, Release Please creates
   the `vX.Y.Z` tag and the GitHub release with the generated changelog, and the
   `publish` job in the same workflow builds, tests and publishes the package to
   npm via [trusted publishing](https://docs.npmjs.com/trusted-publishers).

If there are no releasable commits (only `chore`, `docs`, `ci`, etc.) no release
PR is created, so a release can never be cut with an empty changelog.

## Cutting a release

- Make sure `master` contains the code you want to release, and that CI is green.
- Find the open release PR (labelled `autorelease: pending`), check the version
  and changelog look right, and merge it.

That's it. Watch the `Release` workflow for the publish job.

### Controlling the version

Release Please derives the next version from the commit types since the last
release (`fix:` → patch, `feat:` → minor, `!`/`BREAKING CHANGE` → major). To
override it, add a footer to a commit on `master`:

```
Release-As: 18.0.0
```

## Configuration

| File | Purpose |
| --- | --- |
| `.github/workflows/release.yml` | Release PR maintenance + npm publish |
| `release-please-config.json` | Release Please settings (release type, changelog sections) |
| `.release-please-manifest.json` | Current released version - do not edit by hand |
| `scripts/ci/publish.sh` | Build, test and publish `./dist` to npm |

The optional `RELEASE_PLEASE_TOKEN` secret (a PAT with `repo` scope) lets the
release PR run the normal CI workflows. Without it the workflow falls back to
`GITHUB_TOKEN`, which cannot trigger other workflows, so the release PR itself
will not have CI runs.

### publish.sh

Not intended to be run locally - it requires `CI` to be set and expects the
version in `package.json` to already be the released version. It runs
`build-and-test.sh` (lint, build, test, examples) and then publishes `./dist`.

## If the release fails

Versioning, tagging and the GitHub release all happen before the publish job
runs, so a failed publish leaves the repository in a consistent state - the tag
and GitHub release exist, but npm does not have the version.

To retry, re-run the failed `publish` job from the Actions UI. If the failure
needs a code fix, land the fix on `master` and let the next release PR produce a
new patch version rather than re-tagging the broken one.

## 9.x.x releases

The legacy `9.x.x` branch still uses the older dispatch-based process - see
`.github/workflows/publish-9x.yml` and `scripts/trigger-9x-release.sh`.
