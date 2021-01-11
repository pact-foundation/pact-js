#!/bin/bash -eu

set -x

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

npm ci
npm run dist

git checkout native
npm run build:v3

"${DIR}"/lib/prepare-release.sh

# Link the build so that the examples are always testing the
# current build, in it's properly exported format
(cd dist && npm link)
(cd dist-web && npm link)

echo "Running e2e examples build for node version $(node --version)"
for i in examples/*; do
  [ -e "$i" ] || continue # prevent failure if there are no examples
  echo "--> running tests for: $i"
  if [[ "$i" =~ "ava" ]]; then
    (cd "$i" && npm i && npm link @pact-foundation/pact && npm t || cat logs/*.log)
  else
    if [[ "$i" =~ "karma" ]]; then
      (cd "$i" && npm i && npm link @pact-foundation/pact-web && npm t)
    else
      (cd "$i" && npm i && npm link @pact-foundation/pact && npm t)
    fi
  fi
done

echo "--> Running coverage checks"
npm run coverage

echo "Running V3 e2e examples build"

docker pull pactfoundation/pact-broker
BROKER_ID=$(docker run -e PACT_BROKER_DATABASE_ADAPTER=sqlite -d -p 9292:9292 pactfoundation/pact-broker)

trap "docker kill $BROKER_ID" EXIT

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
