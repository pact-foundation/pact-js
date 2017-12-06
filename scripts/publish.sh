#!/bin/bash

mkdir -p dist-web

echo "--> Copy key artifacts into pact and pact-web distributions"
artifacts=(LICENSE *md package.json)

for artifact in "${artifacts[@]}"; do
  echo "    Copying ${artifact} => ./dist/${artifact}"
  cp ${artifact} ./dist/${artifact}
  echo "    Copying ${artifact} => ./dist-web/${artifact}"
  cp ${artifact} ./dist-web/${artifact}
done

echo "--> Releasing artifacts"
echo "    Publishing pact..."
npm publish dist --tag=beta --access public
echo "    done!"

echo "--> Creating pact-web package"
VERSION=$(cat package.json | grep '\"version\"' | egrep -o "([0-9.]+)")
sed "s/VERSION/$VERSION/g" < package.json.web > dist-web/package.json
# Copy TS types
types=( $(find dist -name "*.d.ts"  | sed 's/dist\///') )
for type in "${types[@]}"; do
  echo "    Copying ${type} => ./dist-web/${type}"
  mkdir -p $(basename "./dist-web/${type}")
  cp -r "dist/${type}" "./dist-web/${type}"
done

echo "    Publishing pact-web..."
npm publish dist-web --tag=beta --access public
echo "    done!"
