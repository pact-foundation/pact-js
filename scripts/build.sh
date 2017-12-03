#!/bin/bash -e

npm run dist

# Only run E2E examples on Node 6+
if [[ "${TRAVIS_NODE_VERSION}" =~ ^[6-8] ]]; then
  echo "Running e2e examples build for node version ${TRAVIS_NODE_VERSION}"
  for i in examples/*; do
    echo "------------------------------------------------"
    echo "------------> continuing to test example project: $i"
    cd "$i"
    npm install
    npm test
    cd ../../
  done
else
  echo "Skipping examples for node version ${TRAVIS_NODE_VERSION}"
fi
