#!/bin/bash -e

set -x
pwd

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

if [ "${TRAVIS_BUILD_STAGE_NAME}" =~ "publish" ]; then
  echo "Skipping build for publish step"
  exit 0
fi

npm run dist

# Link the build so that the examples are always testing the
# current build, in it's properly exported format
(cd dist && npm link)
(cd dist-web && npm link)

git status
git checkout native
cat native/Cargo.toml
npm run build:v3
ls -lh native
# Copy Rust native lib
echo "    Copying ./native => dist/native"
mkdir -p dist/native && cp -r native dist/

echo "Running e2e examples build for node version ${TRAVIS_NODE_VERSION}"
for i in examples/*; do
  [ -e "$i" ] || [$i == "v3"] || continue # prevent failure if there are no examples
  echo "--> running tests for: $i"
  if [[ "$i" =~ "karma" ]]; then
    echo "    linking pact-web"
    (cd "$i" && npm link @pact-foundation/pact-web && npm it)
  else
    echo "    linking pact"
    (cd "$i" && npm link @pact-foundation/pact && npm it)
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
  rm -rf "@pact-foundation/pact"
  echo "linking pact"
  npm link @pact-foundation/pact
  ls -l ../../../dist/native
  ls -l ./node_modules/@pact-foundation/pact/native
  file ./node_modules/@pact-foundation/pact/native/index.node
  objdump -p node_modules/@pact-foundation/pact/native/index.node
  cat node_modules/@pact-foundation/pact/native/Cargo.toml
  npm t
  popd
done
