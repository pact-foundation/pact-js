#!/bin/bash

set -e

for i in *; do
  if [[ -d $i ]]; then
    echo -------------------------------------------------
    echo ---- $i
    echo -------------------------------------------------
    pushd "$i"
    npm i
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
    npm i
    popd
  fi
done
