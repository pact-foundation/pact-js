#!/bin/bash

set -e

for i in *; do
  if [[ -d $i ]]; then
    echo -------------------------------------------------
    echo ---- $i
    echo -------------------------------------------------
    pushd "$i"
    npm i
    rm -rf "node_modules/@pact-foundation/pact"
    echo "linking pact"
    npm link @pact-foundation/pact
    npm t
    popd
  fi  
done
