#!/bin/bash

set -e

export GIT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
export LOG_LEVEL=info
for i in *; do
  if [[ -d $i ]]; then
    echo -------------------------------------------------
    echo ---- $i
    echo -------------------------------------------------
    pushd "$i"
    echo $i
    npm t
    popd
  fi
done

cd v3
for i in *; do
  if [[ -d $i ]]; then
    echo -------------------------------------------------
    echo ---- $i
    echo -------------------------------------------------
    pushd "$i"
    npm t
    popd
  fi
done
