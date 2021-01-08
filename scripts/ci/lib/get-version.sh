#!/bin/bash -eu
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")"; pwd)" # Figure out where the script is running
. "$SCRIPT_DIR"/robust-bash.sh

require_binary grep

VERSION="$(grep '\"version\"' package.json | grep -E -o "([0-9\.]+(-[a-z\.0-9]+)?)")"
echo "$VERSION"