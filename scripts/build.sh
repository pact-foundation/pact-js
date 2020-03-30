#!/bin/bash -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

npm run dist
NPM=$(realpath $(which npm))

# Link the build so that the examples are always testing the
# current build, in it's properly exported format
cd dist && $NPM link | cd ..
cd dist-web && $NPM link | cd ..

echo "Running e2e examples build for node version ${TRAVIS_NODE_VERSION}"
for i in examples/*; do
  [ -e "$i" ] || continue # prevent failure if there are no examples
  echo "------------------------------------------------"
  echo "------------> continuing to test example project: $i"
  cd "$i"
  if [[ "$i" =~ "karma" ]]; then
    echo "linking pact-web"
    $NPM link @pact-foundation/pact-web
  else
    echo "linking pact"
    $NPM link @pact-foundation/pact
  fi
  $NPM it
  cd ../../
done

echo "Running coverage checks"
$NPM run coverage