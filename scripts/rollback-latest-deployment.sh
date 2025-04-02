#!/bin/bash

environment=$1

set -euo pipefail

if [[ "$environment" != "staging" && "$environment" != "production" ]]; then
  echo "Invalid environment '$environment'. Allowed values are 'staging' or 'production'."
  exit 1
fi

export AWS_PROFILE=$environment

echo "Retrieving previous application revision to deploy"

latest_deployment_identifier=$(
  aws deploy list-deployments \
    --application-name AppECS-Forms-form-viewer \
    --deployment-group-name DgpECS-Forms-form-viewer \
    --max-items 1 \
    --output json \
    | jq -r ".deployments[0]"
)

previous_revision_sha256=$(
  aws deploy get-deployment \
    --deployment-id $latest_deployment_identifier \
    --query "deploymentInfo.previousRevision.appSpecContent.sha256" \
    --output text
)

echo "Create deployment using previous revision ($previous_revision_sha256)"

new_deployment_identifier=$(
  aws deploy create-deployment \
    --application-name AppECS-Forms-form-viewer \
    --deployment-group-name DgpECS-Forms-form-viewer \
    --revision revisionType=AppSpecContent,appSpecContent={sha256=a72b5abc6eb1a424b958104085eec8a6fa0bce28ee32d307204dd3c125a8ce8b} \
    --output text
)

echo "Waiting for new deployment to complete... ($new_deployment_identifier)"

aws deploy wait deployment-successful --deployment-id $new_deployment_identifier

echo "Deployment has successfully completed"

echo "Retrieving latest Rainbow deployment identifier"

load_balancer_arn=$(
  aws elbv2 describe-load-balancers \
    --query "LoadBalancers[?LoadBalancerName=='form-viewer'].LoadBalancerArn" \
    --output text
)

listener_arn=$(
  aws elbv2 describe-listeners \
    --load-balancer-arn $load_balancer_arn \
    --query "Listeners[?Protocol=='HTTPS'].ListenerArn" \
    --output text
)

latest_rainbow_rule_arn=$(
  aws elbv2 describe-rules \
    --listener-arn $listener_arn \
    --no-paginate \
    --query "Rules[?contains(Actions[0].ForwardConfig.TargetGroups[0].TargetGroupArn, 'rainbow') && Priority=='1'].RuleArn" \
    --output text
)

rainbow_deployment_identifier=$(aws elbv2 describe-tags \
  --resource-arns $latest_rainbow_rule_arn \
  --output json \
  | jq -r '[.TagDescriptions[].Tags[] | select(.Key == "Name") | .Value | sub("^rainbow-"; "")] | join("")'
)

echo "Cleaning up latest Rainbow deployment ($rainbow_deployment_identifier)"

./clean-up-rainbow-deployment.sh $rainbow_deployment_identifier $listener_arn