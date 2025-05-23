#!/bin/bash

set -euo pipefail

DEPLOYMENT_IDENTIFIER=$1
LISTENER_ARN=$2

echo "Cleaning up Rainbow deployment $DEPLOYMENT_IDENTIFIER"

shorter_deployment_identifier=${DEPLOYMENT_IDENTIFIER:0:24}

existing_load_balancer_listener_rules=$(
  aws elbv2 describe-rules \
    --listener-arn $LISTENER_ARN \
    --no-paginate \
    --query "Rules[?contains(Actions[0].ForwardConfig.TargetGroups[0].TargetGroupArn, '/rainbows-$shorter_deployment_identifier/')].RuleArn" \
    | jq -r ".[]"
)


for rule_arn in $existing_load_balancer_listener_rules; do
 aws elbv2 delete-rule --rule-arn $rule_arn > /dev/null 2>&1
done

last_command_output=$(
  aws elbv2 describe-target-groups --names rainbow-$shorter_deployment_identifier 2>/dev/null || echo "null"
)

if [ "$last_command_output" != "null" ]; then
  existing_load_balancer_target_group=$(echo "$last_command_output" | jq -r ".TargetGroups[0].TargetGroupArn")
  aws elbv2 delete-target-group --target-group-arn $existing_load_balancer_target_group > /dev/null 2>&1
fi

aws lambda delete-function --function-name rainbow-$DEPLOYMENT_IDENTIFIER > /dev/null 2>&1 || true

aws ecr batch-delete-image \
  --repository-name forms_app_legacy \
  --image-ids imageTag=$DEPLOYMENT_IDENTIFIER > /dev/null 2>&1

