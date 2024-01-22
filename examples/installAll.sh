#!/bin/bash

set -e

for i in *; do
  if [[ -d $i ]]; then
    echo -------------------------------------------------
    echo ---- $i
    echo -------------------------------------------------
    pushd "$i"
    npm i
    npm audit fix || true
    popd
  fi
done

pushd v3
for i in *; do
  if [[ -d $i ]]; then
    echo -------------------------------------------------
    echo ---- $i
    echo -------------------------------------------------
    pushd "$i"
    npm i
    npm audit fix || true
    popd
  fi
done
popd
pushd v4
for i in *; do
  if [[ -d $i ]]; then
    echo -------------------------------------------------
    echo ---- $i
    echo -------------------------------------------------
    pushd "$i"
    npm i
    npm audit fix || true
    popd
  fi
done
popd