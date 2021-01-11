#!/bin/bash -eu
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")"; pwd)" # Figure out where the script is running
. "$SCRIPT_DIR"/robust-bash.sh

require_binary grep
require_binary sed
require_binary find

mkdir -p dist-web
VERSION="$("$SCRIPT_DIR/get-version.sh")"

echo "--> Preparing release version ${VERSION}"

echo "--> Copy key artifacts into pact and pact-web distributions"
artifacts=(LICENSE *md package.json)

for artifact in "${artifacts[@]}"; do
  echo "    Copying ${artifact} => ./dist/${artifact}"
  cp "${artifact}" "./dist/${artifact}"
  echo "    Copying ${artifact} => ./dist-web/${artifact}"
  cp "${artifact}" "./dist-web/${artifact}"
done

echo "--> Creating pact-web package"
sed "s/VERSION/${VERSION}/g" < package.json.web > dist-web/package.json

# Copy TS types across
types=( $(find dist -name "*.d.ts" | grep -v node_modules | sed 's/dist\///') )
for type in "${types[@]}"; do
  echo "    Copying ${type} => ./dist-web/${type}"
  echo "creating dir: $(dirname "./dist-web/${type}")"
  mkdir -p "$(dirname "./dist-web/${type}")"
  cp -r "dist/${type}" "./dist-web/${type}"
done
