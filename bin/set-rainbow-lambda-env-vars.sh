#!/bin/bash

set -euo pipefail

LAMBDA_FUNCTION_NAME=$1

TASK_ARN="$(aws ecs list-tasks --cluster Forms --service-name form-viewer --output text --query 'taskArns[0]')"
TASK_DEF_ARN="$(aws ecs describe-tasks --cluster Forms --task "$TASK_ARN" --output text --query 'tasks[0].taskDefinitionArn')"
TASK_DEF="$(aws ecs describe-task-definition --task-definition "$TASK_DEF_ARN")"

# Get environment variables from current task definition
ENV_VARS=$(echo "$TASK_DEF" | jq -r '.taskDefinition.containerDefinitions[0].environment | map("\(.name)=\(.value)") | join(",")')

# Get secrets from current task definition
SECRET_VARS="$(echo "$TASK_DEF" | jq -r '.taskDefinition.containerDefinitions[0].secrets | flatten[] | [.name,.valueFrom] | join("=")')"
while IFS= read -r SECRET; do
    SECRET_NAME="${SECRET%%=*}"
    SECRET_ARN="${SECRET#*=}"
    SECRET_VALUE="$(aws secretsmanager get-secret-value --secret-id "$SECRET_ARN" --query 'SecretString' --output text)"
    ENV_VARS="$ENV_VARS"$','"$SECRET_NAME=$SECRET_VALUE"
done <<< "$SECRET_VARS"

# Set Lambda environment variables
LAMBDA_ENV_VARS="$(echo "$ENV_VARS" | sort | sed -e "s/{/'{/" -e "s/}/}'/")"
aws lambda update-function-configuration --function-name $LAMBDA_FUNCTION_NAME --environment "Variables={$LAMBDA_ENV_VARS}" > /dev/null 2>&1