#!/bin/bash -e

mkdir -p dist-web

VERSION=$(grep '\"version\"' package.json | grep -E -o "([0-9\.]+(-[a-z\.0-9]+)?)")
echo "--> Releasing version ${VERSION}"

echo "--> Copy key artifacts into pact and pact-web distributions"
artifacts=(LICENSE *md package.json)

for artifact in "${artifacts[@]}"; do
  echo "    Copying ${artifact} => ./dist/${artifact}"
  cp ${artifact} ./dist/${artifact}
  echo "    Copying ${artifact} => ./dist-web/${artifact}"
  cp ${artifact} ./dist-web/${artifact}
done

echo "--> Releasing artifacts"
echo "    Publishing pact@${VERSION}..."
npm publish dist --access public --tag proxy-spike
echo "    done!"