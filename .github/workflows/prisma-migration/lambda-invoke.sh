#!/bin/bash

# This script is used to ensure the AWS Lambda function is active and to invoke it for Prisma migrations.
lambda_name="prisma-migration"

lambda_status=$(aws lambda get-function --function-name $lambda_name --query 'Configuration.[State]' --output text)
echo "Lambda function status: $lambda_status"
if [ "$lambda_status" != "Active" ]; then
  echo "Lambda function is not active. Waking up the function."
  # Invoke the Lambda function to wake it up
  aws lambda invoke \
    --function-name $lambda_name \
    response.json || true

  echo "Awaiting Lambda function to wake up..."
  # Wait for the Lambda function to become active
  aws lambda wait function-active-v2 \
    --function-name $lambda_name
fi
echo "Lambda function is active. Proceeding with migration."
# Check if the migration is already in progress

aws lambda invoke \
  --function-name $lambda_name \
  response.json

cat response.json