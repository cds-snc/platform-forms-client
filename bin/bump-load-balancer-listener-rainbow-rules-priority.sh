#!/bin/bash

set -euo pipefail

LISTENER_ARN=$1

rules_priority_to_bump=""
priority_number=2

rules=$(aws elbv2 describe-rules \
  --listener-arn $LISTENER_ARN \
  --no-paginate \
  --query "Rules[*].RuleArn" \
  --output text)

for rule_arn in $rules; do
  tag_value=$(aws elbv2 describe-tags --resource-arn $rule_arn --query "TagDescriptions[0].Tags[0].Value" --output text)

  if [[ $tag_value == "rainbow"* ]]; then
    rules_priority_to_bump="$rules_priority_to_bump"$','"{\"RuleArn\":\"$rule_arn\",\"Priority\":$priority_number}"
    priority_number=$((priority_number+1))
  fi
done

if [[ ! -z "$rules_priority_to_bump" ]]; then
   aws elbv2 set-rule-priorities --rule-priorities "[${rules_priority_to_bump:1}]"
fi