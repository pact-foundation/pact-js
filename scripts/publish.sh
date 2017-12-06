#!/bin/bash

mkdir -p dist-web

echo "--> Copy key artifacts into pact and pact-web distributions"
artifacts=(LICENSE *md)

for artifact in "${artifacts[@]}"; do
  echo "    Copying ${artifact} => ./dist/${artifact}"
  cp ${artifact} ./dist/${artifact}
  echo "    Copying ${artifact} => ./dist-web/${artifact}"
  cp ${artifact} ./dist-web/${artifact}
done

echo "--> Releasing artifacts"
echo "    Publishing pact..."
npm publish dist --tag beta --access public
echo "    done!"

echo "--> Creating pact-web package"
VERSION=$(cat package.json | grep '\"version\"' | egrep -o "([0-9.]+)")
sed "s/VERSION/$VERSION/g" < package.json.web > dist-web/package.json

echo "    Publishing pact-web..."
npm publish dist-web --tag beta --access public
echo "    done!"
