#!/bin/bash -eu
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")"; pwd)" # Figure out where the script is running
. "$SCRIPT_DIR"/robust-bash.sh

require_binary grep
require_binary sed
require_binary find

VERSION="$("$SCRIPT_DIR/get-version.sh")"

echo "--> Preparing release version ${VERSION}"

echo "--> Copy key artifacts into pact distribution"
artifacts=(LICENSE *md package.json)

for artifact in "${artifacts[@]}"; do
  echo "    Copying ${artifact} => ./dist/${artifact}"
  cp "${artifact}" "./dist/${artifact}"
done
