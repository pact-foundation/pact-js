set +x #Don't echo the NPM key

NPMRC_FILE=.npmrc
echo "@pact-foundation:registry=https://registry.npmjs.org/" > $NPMRC_FILE
echo "//registry.npmjs.org/:_authToken=${NPM_KEY}" >> $NPMRC_FILE
echo "//registry.npmjs.org/:username=pact-foundation" >> $NPMRC_FILE
echo "//registry.npmjs.org/:email=pact-foundation@googlegroups.com" >> $NPMRC_FILE
echo "//registry.npmjs.org/:always-auth=true" >> $NPMRC_FILE

set -x

VERSION=$(cat package.json | grep '\"version\"' | grep -E -o "([0-9\.]+)")
sed "s/VERSION/$VERSION/g" < package.json.web > dist/package.json
cp -irn src/* dist/

