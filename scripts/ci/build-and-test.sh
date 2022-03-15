#!/bin/bash
set -e
set -u

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

npm ci
npm run dist

export PACT_BROKER_USERNAME="dXfltyFMgNOFZAxr8io9wJ37iUpY42M"
export PACT_BROKER_PASSWORD="O5AIZWxelWbLvqMd8PkAVycBJh2Psyg1"

"${DIR}"/lib/prepare-release.sh

echo "This will be version '$(npx @pact-foundation/absolute-version)'"

# Link the build so that the examples are always testing the
# current build, in it's properly exported format
(cd dist && npm link)
(cd dist-web && npm link)

echo "Running e2e examples build for node version $(node --version)"
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
