# Releasing

We've moved to GitHub Actions for releases.

## How a release works

Releases trigger when the repository recieves the custom repository_dispatch event
`release-triggered`.

This triggers the `publish.yml` workflow, which in turn
triggers the `release.sh` script in `scripts/ci`.
The workflow will also create a github release with an appropriate changelog.

Having the release triggered by a custom event is useful for automating
releases in the future (eg for version bumps in pact dependencies).

### Release.sh

This script is not intended to be run locally. Note that it modifies your git
settings.

The script will:

- Modify git authorship settings
- Confirm that there would be changes in the changelog after release
- Run Lint
- Run Build
- Run Test
- Commit an appropriate version bump, changelog and tag
- Package and publish to npm
- Push the new commit and tag back to the main branch.

Should you need to modify the script locally, you will find it uses some
dependencies in `scripts/ci/lib`.

## Kicking off a release

You must be able to create a github access token with `repo` scope to the
pact-js repository.

- Set an environment variable `GITHUB_ACCESS_TOKEN_FOR_PF_RELEASES` to this token.
- Make sure master contains the code you want to release
- Run `scripts/trigger-release.sh`

Then wait for github to do its magic. It will release the current head of master.

Note that the release script refuses to publish anything that wouldn't
produce a changelog. Please make sure your commits follow the guidelines in
`CONTRIBUTING.md`

## If the release fails

The publish is the second to last step, so if the release fails, you don't
need to do any rollbacks.

However, there is a potential for the push to fail _after_ a publish if there
are new commits to master since the release started. This is unlikely with
the current commit frequency, but could still happen. Check the logs to
determine if npm has a version that doesn't exist in the master branch.

If this has happened, you will need to manually put the release commit in.

```
# First delete the new tag
#   somehow this ends up in the repository
#   even though the push fails.

git checkout master
git pull --tags
git tag -d <broken-version>
git push -delete origin <broken-version>


# If there are changes that introduce features, then you'll have to branch and probably rebase

# Now create a new commit + tag for the version:
npm run release

# Push that tag + commit
git push origin master --follow-tags

```

- Don't forget to create a new release in github.

Depending on the nature of the new commits to master after the release, you
may need to rebase them on top of the tagged release commit and force push (only do this
if the released version would be different to the version tagged by `npm run release`)
