#!/usr/bin/env bash

set -o errexit
set -o nounset
set -o pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"

BASE_REF="${1:-main}"
REMOTE_REF="origin/${BASE_REF}"
PACKAGE_NAME="@gcforms/database"
PACKAGE_DIR="packages/database"

git fetch origin "$BASE_REF"

changed_dirs=$(git diff --dirstat=files,0 "$REMOTE_REF"...HEAD packages/ | cut -d'/' -f2 | sort -u)

if [[ -z "$changed_dirs" ]]; then
  echo "No package changes detected. Skipping ${PACKAGE_NAME} dependency check."
  exit 0
fi

if [[ ! -f "$PACKAGE_DIR/package.json" ]]; then
  echo "$PACKAGE_DIR/package.json not found. Skipping ${PACKAGE_NAME} dependency check."
  exit 0
fi

echo "Checking changed packages for recursive ${PACKAGE_NAME} usage: $changed_dirs"

dependent_workspaces=$(yarn info "$PACKAGE_NAME" -A -R --dependents --json \
  | jq -r 'select(.value | type == "string") | .value')

status=0
for dir in $changed_dirs; do
  package_json="packages/$dir/package.json"

  if [[ ! -f "$package_json" ]]; then
    echo "Skipping packages/$dir because package.json is missing"
    continue
  fi

  package_name=$(jq -r .name "$package_json")

  if [[ "$package_name" == "$PACKAGE_NAME" ]]; then
    echo "Skipping ${PACKAGE_NAME} package itself"
    continue
  fi

  workspace_locator="$package_name@workspace:packages/$dir"
  if echo "$dependent_workspaces" | grep -Fxq "$workspace_locator"; then
    echo -e "☠️ \033[0;31m$package_name recursively depends on ${PACKAGE_NAME} and cannot be published safely yet\033[0m"
    status=1
  else
    echo -e "✅ \033[0;32m$package_name does not recursively depend on ${PACKAGE_NAME}\033[0m"
  fi
done

exit $status