#!/bin/bash
set -euo pipefail

# 
# Deregisters and deletes ECS task definitions in an AWS account.  It expects as 
# input the action to perform (DEREGISTER or DELETE) and a file path that contains 
# a list of ECS task definition ARNs (one per line):
#
#   ./delete-ecs-task-defs.sh DEREGISTER task-arns.txt
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

ACTION="$1"
TASK_ARNS="$2"
AWS_REGION="ca-central-1"
CLUSTER_NAME="Forms"
SERVICE_NAME="form-viewer"

# Exit if the ACTION is invalid
if [ "$ACTION" != "DEREGISTER" ] && [ "$ACTION" != "DELETE" ]; then
    echo "❌ Invalid action: $ACTION"
    exit 1
fi

# Get the currently active task definition ARN as a safety check
ACTIVE_TASK_ARN="$(aws ecs describe-services \
    --cluster $CLUSTER_NAME \
    --services $SERVICE_NAME \
    --query 'services[0].taskDefinition' \
    --no-cli-pager \
    --output text \
    --region $AWS_REGION)"

while read -r TASK_ARN
do

    if [ "$TASK_ARN" == "$ACTIVE_TASK_ARN" ]; then
        echo  "🚫 Skipping active task definition: $TASK_ARN"
        continue
    fi

    # To delete a task, it must be deregistered first
    if [ "$ACTION" == "DEREGISTER" ] || [ "$ACTION" == "DELETE" ]; then
        echo  "🗑️  Deregistering: $TASK_ARN"
        aws ecs deregister-task-definition \
            --task-definition "$TASK_ARN" \
            --region "$AWS_REGION" \
            --no-cli-pager > /dev/null 2>&1
        sleep 2
    fi

    if [ "$ACTION" == "DELETE" ]; then
        echo  "🧹 Deleting: $TASK_ARN"
        aws ecs delete-task-definitions \
            --task-definitions "$TASK_ARN" \
            --region "$AWS_REGION" \
            --no-cli-pager > /dev/null 2>&1
        sleep 2
    
    fi
done < "$TASK_ARNS"

echo  "🎉 All done!"
