#!/bin/bash -e

npm run dist

echo "Running e2e examples build for node version ${TRAVIS_NODE_VERSION}"
for i in examples/*; do
  echo "------------------------------------------------"
  echo "------------> continuing to test example project: $i"
  cd "$i"
  npm install
  npm test
  cd ../../
done

