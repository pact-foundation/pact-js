#!/bin/bash -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

VERSION=$(grep '\"version\"' package.json | grep -E -o "([0-9\.]+(-[a-z\.0-9]+)?)")
NODE_VERSION=$(node --version)
echo "--> Releasing native library for version ${VERSION} and Node version ${NODE_VERSION}"

npm install node-pre-gyp node-pre-gyp-github
npm run build:v3
rm -rf native/target
npm run upload-binary
