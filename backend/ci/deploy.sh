#!/bin/sh

set -exou

apk --no-cache add curl

# Get the latest lightsailctl
curl "https://s3.us-west-2.amazonaws.com/lightsailctl/latest/linux-amd64/lightsailctl" -o "/usr/local/bin/lightsailctl"
chmod +x "/usr/local/bin/lightsailctl"

# get deployment file
aws ssm get-parameter --name "/ibriz/ai-agent/${CI_COMMIT_BRANCH}/env" --with-decryption --region us-west-2 --query "Parameter.Value" --output text > deployment.yaml
# deploy lightsail container
aws lightsail create-container-service-deployment --service-name "ai-agent-${CI_COMMIT_BRANCH}" --cli-input-yaml file://deployment.yaml
