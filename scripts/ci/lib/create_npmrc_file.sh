#!/bin/bash -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")"; pwd)" # Figure out where the script is running
. "$SCRIPT_DIR"/robust-bash.sh

require_env_var NODE_AUTH_TOKEN

set +x #Don't echo the NPM key

NPMRC_FILE=.npmrc
echo  "@pact-foundation:registry=https://registry.npmjs.org/" > $NPMRC_FILE
echo "//registry.npmjs.org/:_authToken=${NODE_AUTH_TOKEN}" >> $NPMRC_FILE
echo "//registry.npmjs.org/:username=pact-foundation" >> $NPMRC_FILE
echo "//registry.npmjs.org/:email=pact-foundation@googlegroups.com" >> $NPMRC_FILE
echo "//registry.npmjs.org/:always-auth=true" >> $NPMRC_FILE

set -x
