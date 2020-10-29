#!/bin/bash -e

. $NVM_DIR/nvm.sh

VERSION=$(grep '\"version\"' package.json | grep -E -o "([0-9\.]+(-[a-z\.0-9]+)?)")
NODE_VERSION=$(node --version)
echo "--> Releasing native library for version ${VERSION} and Node version ${NODE_VERSION}"

pwd
ls -la

npm install
npm run build:v3
rm -rf native/target
npm run package
echo "::set-output name=packageJson::$(node ./scripts/native-lib-details.js)"
