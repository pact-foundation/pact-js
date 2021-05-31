#!/bin/bash -eu

set -x

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

npm ci
git checkout native
npm run dist
npm run build:v3

"${DIR}"/lib/prepare-release.sh

# Copy Rust native lib
echo "    Copying ./native => dist/native"
mkdir -p dist/native && cp -r native dist/
rm -rf dist/native/target

# Link the build so that the examples are always testing the
# current build, in it's properly exported format
(cd dist && npm link)

echo "Running e2e examples build for node version $(node --version)"
for i in examples/*; do
  [ -e "$i" ] || continue # prevent failure if there are no examples
  echo "--> running tests for: $i"
  if [[ "$i" =~ "karma" ]]; then
    (cd "$i" && npm install && npm test)
  else
    (cd "$i" && npm install && npm link @pact-foundation/pact && npm test)
  fi
done

echo "--> Running coverage checks"
npm run coverage

echo "Running V3 e2e examples build"

docker pull pactfoundation/pact-broker
BROKER_ID=$(docker run -e PACT_BROKER_DATABASE_ADAPTER=sqlite -d -p 9292:9292 pactfoundation/pact-broker)

trap "docker kill $BROKER_ID" EXIT

for i in examples/v3/*; do
  [ -d "$i" ] || continue # prevent failure if not a directory
  [ -e "$i" ] || continue # prevent failure if there are no examples
  echo "------------------------------------------------"
  echo "------------> continuing to test V3 example project: $i"
  node --version
  pushd "$i"
  npm install
  rm -rf "node_modules/@pact-foundation/pact"
  echo "linking pact"
  npm link @pact-foundation/pact
  npm test
  popd
done
