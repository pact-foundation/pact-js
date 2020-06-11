# Releasing

## Publishing via Travis (recommended)

- Update the version number in each `package.json` file to latest version
- Commit

        $ npm run release
        $ # review workspace and commits - if all looks good...
        $ git push --follow-tags

Travis CI will do the rest.

## How to re-tag if a publish fails

Delete broken tag:

    $ git tag -d "X.Y.Z" && git push origin :refs/tags/X.Y.Z

Now you can re-tag and push as above.

## Publishing manually

Log in to npm as pact-foundation.

Run the following commands:

    $ npm run dist
    $ npm run coverage
    $ npm prune --production
    $ tar -czvf pactjs.tar.gz config dist src package.json README.md LICENSE
    $ npm run deploy:prepare
    $ script: npm publish dist --access public

This should have published the latest version, check to see that at npmjs.com/package/pact.
We now need to create a GitHub release, upload zipped distribution (pactjs.tar.gz) to [GitHub Releases](https://github.com/pact-foundation/pact-js/releases).

## Updating NPM key

Log in to pact-foundation npm account in a browser and revoke the old key in the Tokens section.
Delete the env.global.secure key from travis.yml
Log in to npm via command line using the pact-foundation account.
Echo the ~/.npmrc file and grab the token out of it.

    $ gem install travis
    $ travis encrypt NPM_KEY=${NPM_KEY} --add env.global

## v3.0.0

The native binaries required for post-install are trigerred [Github Actions](https://github.com/pact-foundation/pact-js/actions) on successful travis builds.

Occasionally, you may need to generate these binaries manually. You can do so by running the command as follows (be careful to substitute branches/tagse etc.):

To produce a darwin build, run from a Mac:

```
export NODE_PRE_GYP_GITHUB_TOKEN=<your github access token>
npm install node-pre-gyp node-pre-gyp-github
npm run build:v3
rm -rf native/target
npm run upload-binary
```

For linux64 (update version of node you need to release from in the docker image name). Please run the steps by hand:

```
docker run --rm -it -v $(pwd):/app node:latest bash
apt-get update -y
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | \
    sh -s -- -y
#
# choose 1 to progress
#
source $HOME/.cargo/env
export NODE_PRE_GYP_GITHUB_TOKEN=<your github access token>
cd /app
rm -rf node_modules build
npm ci
npm install node-pre-gyp node-pre-gyp-github
npm run build:v3
rm -rf native/target
npm run upload-binary
```
