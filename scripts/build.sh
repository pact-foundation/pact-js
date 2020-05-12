#!/bin/bash -e

set -x
pwd

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

npm run dist
"${DIR}"/prepare.sh

git checkout native
npm run build:v3
rm -rf native/target
# Copy Rust native lib
echo "    Copying ./native => dist/native"
mkdir -p dist/native && cp -r native dist/

# Link the build so that the examples are always testing the
# current build, in it's properly exported format
(cd dist && npm link)
(cd dist-web && npm link)

echo "Running e2e examples build for node version ${TRAVIS_NODE_VERSION}"
for i in examples/*; do
  [ -e "$i" ] || continue # prevent failure if there are no examples
  echo "--> running tests for: $i"
  if [[ "$i" =~ "karma" ]]; then
    (cd "$i" && npm i && npm link @pact-foundation/pact-web && npm t)
  else
    (cd "$i" && npm i && npm link @pact-foundation/pact && npm t)
  fi
done

echo "--> Running coverage checks"
npm run coverage

echo "Running V3 e2e examples build for node version ${TRAVIS_NODE_VERSION}"
for i in examples/v3/*; do
  [ -e "$i" ] || continue # prevent failure if there are no examples
  echo "------------------------------------------------"
  echo "------------> continuing to test V3 example project: $i"
  node --version
  pushd "$i"
  npm i
  rm -rf "node_modules/@pact-foundation/pact"
  echo "linking pact"
  npm link @pact-foundation/pact
  npm t
  popd
done
