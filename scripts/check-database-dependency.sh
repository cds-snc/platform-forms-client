#!/usr/bin/env sh

set -eu

if (set -o pipefail) 2>/dev/null; then
  set -o pipefail
fi

REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"

BASE_REF="${1:-main}"
REMOTE_REF="origin/${BASE_REF}"
PACKAGE_NAME="synckit"

git fetch origin "$BASE_REF"

changed_dirs=$(
  git diff --name-only "$REMOTE_REF"...HEAD -- packages/ \
    | sed -n 's#^packages/\([^/]*\)/.*#\1#p' \
    | sort -u
)

root_dependency_graph_changed=false
if ! git diff --quiet "$REMOTE_REF"...HEAD -- package.json yarn.lock; then
  root_dependency_graph_changed=true
fi

if [ -z "$changed_dirs" ] && [ "$root_dependency_graph_changed" = false ]; then
  echo "No package changes detected. Skipping ${PACKAGE_NAME} dependency check."
  exit 0
fi

recursive_dependent_roots=$(yarn why "$PACKAGE_NAME" -R \
  | sed -n 's/^[[:space:]]*[├└]─ //p' \
  | sed -E 's/@(npm|workspace|patch|portal|file|link):.*$//' \
  | sort -u)

if [ -z "$recursive_dependent_roots" ]; then
  echo "No recursive dependents found for ${PACKAGE_NAME}."
  exit 0
fi

describe_dependency_matches() {
  manifest_path="$1"
  label="$2"

  if [ ! -f "$manifest_path" ]; then
    echo "Skipping ${label} because ${manifest_path} is missing"
    return
  fi

  declared_dependencies=$(jq -r '
    [.dependencies, .devDependencies, .peerDependencies, .optionalDependencies]
    | map(select(. != null) | keys)
    | add
    | unique
    | .[]?
  ' "$manifest_path")

  if [ -z "$declared_dependencies" ]; then
    echo -e "✅ \033[0;32m${label} has no declared dependencies to inspect\033[0m"
    return
  fi

  matched_dependencies=$(printf '%s\n' "$declared_dependencies" \
    | while IFS= read -r dependency; do
        if [ -n "$dependency" ] && printf '%s\n' "$recursive_dependent_roots" | grep -Fxq "$dependency"; then
          printf '%s\n' "$dependency"
        fi
      done \
    | paste -sd' ' -)

  if [ -n "$matched_dependencies" ]; then
    echo -e "☠️ \033[0;31m${label} recursively depends on ${PACKAGE_NAME} via: ${matched_dependencies}\033[0m"
    status=1
  else
    echo -e "✅ \033[0;32m${label} does not recursively depend on ${PACKAGE_NAME}\033[0m"
  fi
}

if [ "$root_dependency_graph_changed" = true ]; then
  echo "Checking root workspace for recursive ${PACKAGE_NAME} usage"
else
  echo "Checking changed packages for recursive ${PACKAGE_NAME} usage: $(printf '%s ' $changed_dirs)"
fi

status=0
if [ "$root_dependency_graph_changed" = true ]; then
  describe_dependency_matches "package.json" "root workspace"
fi

for dir in $changed_dirs; do
  package_json="packages/$dir/package.json"

  if [ ! -f "$package_json" ]; then
    echo "Skipping packages/$dir because package.json is missing"
    continue
  fi

  package_name=$(jq -r --arg dir "$dir" '.name // ("packages/" + $dir)' "$package_json")
  describe_dependency_matches "$package_json" "$package_name"
done

exit $status