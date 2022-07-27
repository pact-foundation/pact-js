#!/bin/bash

# Script to trigger release of the repository
# Requires a Github API token with repo scope stored in the
# environment variable GITHUB_ACCESS_TOKEN_FOR_PF_RELEASES
# Borrowed from Beth Skurrie's excellent script at
# https://github.com/pact-foundation/pact-ruby/blob/master/script/trigger-release.sh

: "${GITHUB_ACCESS_TOKEN_FOR_PF_RELEASES:?Please set environment variable GITHUB_ACCESS_TOKEN_FOR_PF_RELEASES}"

repository_slug=$(git remote get-url $(git remote show) | cut -d':' -f2 | sed 's/\.git//' | sed 's://::' | sed 's:github.com/::')

output=$(curl -v -X POST https://api.github.com/repos/${repository_slug}/dispatches \
      -H 'Accept: application/vnd.github.everest-preview+json' \
      -H "Authorization: Bearer $GITHUB_ACCESS_TOKEN_FOR_PF_RELEASES" \
      -d "{\"event_type\": \"release-9x-triggered\"}" 2>&1)

if  ! echo "${output}" | grep "HTTP\/2 204" > /dev/null; then
  echo "$output" | sed  "s/${GITHUB_ACCESS_TOKEN_FOR_PF_RELEASES}/********/g"
  echo "Failed to trigger release"
  exit 1
else
  echo "9.x.x Release workflow triggered"
fi
