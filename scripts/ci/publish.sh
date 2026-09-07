#!/bin/bash
set -e
set -u

# Builds, tests and publishes the package to npm.
#
# Versioning, changelog generation, tagging and the GitHub release are all
# handled by Release Please (see .github/workflows/release.yml) - by the time
# this script runs, package.json already contains the released version.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")"; pwd)" # Figure out where the script is running
. "$SCRIPT_DIR"/lib/robust-bash.sh

require_env_var CI "This script must be run from CI."

VERSION="$("$SCRIPT_DIR/lib/get-version.sh")"
echo "--> Building and publishing version ${VERSION}"

"$SCRIPT_DIR"/build-and-test.sh

"$SCRIPT_DIR"/lib/publish.sh
