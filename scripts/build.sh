#!/bin/bash -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

npm run dist
"${DIR}"/prepare.sh

# Link the build so that the examples are always testing the
# current build, in it's properly exported format
(cd dist && npm link)
(cd dist-web && npm link)

echo "Running e2e examples build for node version ${TRAVIS_NODE_VERSION}"
for i in examples/*; do
  [ -e "$i" ] || [$i == "v3"] || continue # prevent failure if there are no examples
  echo "------------------------------------------------"
  echo "------------> continuing to test example project: $i"
  pushd "$i"
  if [[ "$i" =~ "karma" ]]; then
    echo "linking pact-web"
    npm link @pact-foundation/pact-web
  else
    echo "linking pact"
    npm link @pact-foundation/pact
  fi
  npm it
  popd
done

echo "Running V3 e2e examples build for node version ${TRAVIS_NODE_VERSION}"
for i in examples/v3/*; do
  [ -e "$i" ] || continue # prevent failure if there are no examples
  echo "------------------------------------------------"
  echo "------------> continuing to test V3 example project: $i"
  pushd "$i"
  npm i
  echo "linking pact"
  npm link @pact-foundation/pact
  npm t
  popd
done
