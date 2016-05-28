#!/bin/bash
set -ev

echo "#### BUILDING DSL"
pushd ./pact-dsl
npm install
npm run dist
popd

echo "#### BUILDING INTERCEPTOR"
pushd ./pact-interceptor
npm install
npm run dist
popd

echo "#### BUILDING MOCHA INTERFACE"
pushd ./pact-mocha-interface
npm install
popd
