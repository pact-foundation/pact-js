#!/bin/bash -eu

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

for i in examples/*; do
  [ -e "$i" ] || continue # prevent failure if there are no examples
  echo "--> running npm audit fix on: $i"
  if [ -z "${1:-}" ]; then
    (cd "$i" && npm audit fix)
  else 
    (cd "$i" && npm audit fix "$1")
  fi
done