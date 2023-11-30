#!/bin/sh

#
# Entrypoint for the PR review environment lambda function.  This script loads the function's
# environment variables from the SSM ParameterStore `/form-viewer/env` and exports them
# into the current execution environment.  If a matching value has already been set as one
# of the function's environment variables, it takes precedence.
#

set -e

ENV_PATH="/tmp/form-viewer"
TMP_ENV_FILE="$ENV_PATH/.env"

# Check if a variable exists in the execution environment and is not empty
var_expand() {
  if [ -z "${1-}" ] || [ $# -ne 1 ]; then
    printf 'var_expand: expected one argument\n' >&2;
    return 1;
  fi
  eval printf '%s' "\"\${$1?}\"" 2> /dev/null # Variable double substitution to be able to check for variable
}

# Export variables from a .env file into the current execution environment
load_non_existing_envs() {
  _isComment='^[[:space:]]*#'
  _isBlank='^[[:space:]]*$'
  while IFS= read -r line; do
    if echo "$line" | grep -Eq "$_isComment"; then # Ignore comment line
      continue
    fi
    if echo "$line" | grep -Eq "$_isBlank"; then # Ignore blank line
      continue
    fi
    key=$(echo "$line" | cut -d '=' -f 1)
    value=$(echo "$line" | cut -d '=' -f 2-)

    if [ -z "$(var_expand "$key")" ]; then # Check if environment variable doesn't exist
      export "${key}=${value}"
    fi
  done < $TMP_ENV_FILE
}

echo "INFO Retrieving environment parameters"
if [ ! -f "$ENV_PATH/.env" ]; then
    if [ ! -d "$ENV_PATH" ]; then
        mkdir "$ENV_PATH"
    fi

    aws ssm get-parameters \
        --region ca-central-1 \
        --with-decryption \
        --names /form-viewer/env \
        --query 'Parameters[*].Value' \
        --output text | sed 's/\t\t*/\n/g' > "$TMP_ENV_FILE"
fi

# Check if env vars were retrieved
if [ ! -s "$TMP_ENV_FILE" ]; then
    echo "WARNING Failed to retrieve env vars in entrypoint"
    rm "$TMP_ENV_FILE"
    exit 1
fi
load_non_existing_envs

echo "INFO Starting lambda handler"
exec node server.js
