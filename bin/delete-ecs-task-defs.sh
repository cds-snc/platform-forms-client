#!/bin/bash
set -euo pipefail

# 
# Deletes ECS task definitions in an AWS account.  It expects as input a
# file path that contains a list of ECS task definition ARNs (one per line):
#
#   ./delete-ecs-task-defs.sh task-arns.txt
#
# This file can be created with the following command which will generate
# a `task-arns.txt` file with all but the last 5 most recent task definitions:
#
#   aws ecs list-task-definitions \
#     --sort ASC \
#     --status ACTIVE \
#     --region ca-central-1 \
#     --no-cli-pager \
#     | jq -r '(.taskDefinitionArns[:length-6])[]' > task-arns.txt
#
# The sleep commands in the script are to avoid API throttling issues.
#

TASK_ARNS="$1"
AWS_REGION="ca-central-1"

while read -r TASK_ARN
do
    echo  "🧹 Deleting: $TASK_ARN"

    # Task definitions must be set to INACTIVE before they can be deleted
    aws ecs deregister-task-definition \
        --task-definition "$TASK_ARN" \
        --region "$AWS_REGION" \
        --no-cli-pager > /dev/null 2>&1
    sleep 3

    # Delete the INACTIVE task definition
    aws ecs delete-task-definitions \
        --task-definitions "$TASK_ARN" \
        --region "$AWS_REGION" \
        --no-cli-pager > /dev/null 2>&1
    sleep 3
done < "$TASK_ARNS"

echo  "🎉 All done!"
