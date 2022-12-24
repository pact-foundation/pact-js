#!/bin/bash -eu
set -eu

#######
# Usage 
# run-audit-fix-on-examples.sh 
####

# Colours
blue='\033[1;34m'
red='\033[0;31m'
green='\033[0;32m'
end_colour='\033[0m'


ADDITIONAL_ARG=${1:-}
PROBLEM_REPOS=()

banner_border() {
  banner_mid "$* " | sed 's/./-/g'
}

# banner based on https://unix.stackexchange.com/a/250094
banner_mid() {
  echo "- $* "
}

fail_banner() {
  echo -e "${red}$(banner_border "❌  $*")${end_colour}"
  echo -e "${red}$(banner_mid    "❌  $*")${end_colour}"
  echo -e "${red}$(banner_border "❌  $*")${end_colour}"
}

log_banner() {
  echo -e "${blue}$(banner_border "🛠️  $*")${end_colour}"
  echo -e "${blue}$(banner_mid    "🛠️  $*")${end_colour}"
  echo -e "${blue}$(banner_border "🛠️  $*")${end_colour}"
}

success_banner() {
  echo -e "${green}$(banner_border "✅  $*")${end_colour}"
  echo -e "${green}$(banner_mid    "✅  $*")${end_colour}"
  echo -e "${green}$(banner_border "✅  $*")${end_colour}"
}

audit_fix() {
  if [ -z "${1:-}" ]; then 
    fail_banner "Script error: ${FUNCNAME[0]} requires an argument"
    exit 1
  fi

  if [ -d "$1" ] && [ -e "$i/package.json" ]; then
    log_banner "Audit fix on $1"
    if [ -z "${ADDITIONAL_ARG:-}" ]; then
      if ! ( cd "$1" ; npm i ; npm audit --audit-level none ; npm audit fix)
      then
        fail_banner "$i failed audit fix"
        PROBLEM_REPOS+=("$i")
      fi
     fi
  else
    log_banner "Skipping $1 as it is not a directory or does not have a package.json"
  fi
}

for i in examples/*; do
  audit_fix "$i"
done

for i in examples/v3/*; do
   audit_fix "$i"
done

for i in examples/v4/*; do
   audit_fix "$i"
done

if [ ${#PROBLEM_REPOS[@]} -eq 0 ]; then
  success_banner "All examples updated successfully"
else
  fail_banner "The following examples failed to audit fix, and need manual attention:"

  echo -e "${red}$(printf '   %s\n' "${PROBLEM_REPOS[@]}")${end_colour}"
  exit 1
fi