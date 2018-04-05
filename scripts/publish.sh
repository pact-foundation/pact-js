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
npm publish dist --access public --tag prerelease
echo "    done!"

echo "--> Creating pact-web package"
sed "s/VERSION/${VERSION}/g" < package.json.web > dist-web/package.json
# Copy TS types across
types=( $(find dist -name "*.d.ts"  | sed 's/dist\///') )
for type in "${types[@]}"; do
  echo "    Copying ${type} => ./dist-web/${type}"
  echo "creating dir: " $(dirname "./dist-web/${type}")
  mkdir -p $(dirname "./dist-web/${type}")
  cp -r "dist/${type}" "./dist-web/${type}"
done

echo "    Publishing pact-web@${VERSION}..."
npm publish dist-web --access public --tag prerelease
echo "    done!"
