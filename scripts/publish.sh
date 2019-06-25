#!/bin/bash -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

"${DIR}"/prepare.sh

VERSION=$(grep '\"version\"' package.json | grep -E -o "([0-9\.]+(-[a-z\.0-9]+)?)")
echo "--> Releasing version ${VERSION}"

echo "--> Releasing artifacts"
echo "    Publishing pact@${VERSION}..."
npm publish dist --access public --tag latest
echo "    done!"

echo "    Publishing pact-web@${VERSION}..."
npm publish dist-web --access public --tag latest
echo "    done!"
