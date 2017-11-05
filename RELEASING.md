# Releasing

## Publishing via Travis (recommended)

* Update the version number in each `package.json` file to latest version
* Commit

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
