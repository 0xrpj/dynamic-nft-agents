#!/bin/sh

set -exou

# add aws cli
apk add --no-cache curl docker-cli

# Get the latest lightsailctl
curl "https://s3.us-west-2.amazonaws.com/lightsailctl/latest/linux-amd64/lightsailctl" -o "/usr/local/bin/lightsailctl"
chmod +x "/usr/local/bin/lightsailctl"

docker ps
docker info
# Build the image
docker build -t $CI_COMMIT_SHORT_SHA .
# Push the image to lightsail
aws lightsail push-container-image --region ap-south-1 --service-name "ai-agent-$CI_COMMIT_BRANCH" --label "ai-agent" --image "$CI_COMMIT_SHORT_SHA"
