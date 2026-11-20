#!/bin/sh
set -eu

: "${GITLAB_PACKAGE_GROUP_ID:?Set GITLAB_PACKAGE_GROUP_ID in Vercel}"
: "${GITLAB_NPM_TOKEN:?Set GITLAB_NPM_TOKEN in Vercel}"

printf '@mono:registry=https://gitlab.com/api/v4/groups/%s/-/packages/npm/\n//gitlab.com/api/v4/groups/%s/-/packages/npm/:_authToken=%s\n//gitlab.com/api/v4/projects/89199789/packages/npm/:_authToken=%s\n//gitlab.com/api/v4/projects/89199810/packages/npm/:_authToken=%s\n' \
  "$GITLAB_PACKAGE_GROUP_ID" \
  "$GITLAB_PACKAGE_GROUP_ID" \
  "$GITLAB_NPM_TOKEN" \
  "$GITLAB_NPM_TOKEN" \
  "$GITLAB_NPM_TOKEN" > .npmrc

pnpm install --frozen-lockfile
