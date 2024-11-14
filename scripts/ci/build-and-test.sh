#!/bin/bash -eu
set -e
set -u
set -x

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")"; pwd)" # Figure out where the script is running
. "$SCRIPT_DIR"/lib/robust-bash.sh

npm ci

npm run dist
cp package.json ./dist

export GIT_BRANCH=${GITHUB_HEAD_REF:-${GIT_REF#refs/heads/}}

"${SCRIPT_DIR}"/lib/prepare-release.sh

echo "--> Running coverage checks"
npm run coverage

cp package-lock.json dist
cp -r scripts dist
echo "This will be version '$(npx --yes absolute-version)'"

if [ x"${SKIP_EXAMPLES:-}" == "x" ]; then 
  echo "running all examples as SKIP_EXAMPLES not set"
  "${SCRIPT_DIR}"/test-examples.sh
else
  echo "skipping examples as SKIP_EXAMPLES set"
fi