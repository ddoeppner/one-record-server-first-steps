#!/bin/bash

set -e

AREA_NAME=dev
AWS_DEFAULT_REGION=us-east-1
CDK_DEFAULT_REGION=us-east-1

sudo yum install -y jq

cd ne-one-cdk

npm i

cdk bootstrap -c envName=$AREA_NAME

cdk deploy --require-approval never -c envName=$AREA_NAME --trace --outputs-file ./cdk-outputs.json

# extract variables
REPOS_URI=$(../cdk-output-parser.sh NeOneCdkStack$AREA_NAME appRepositoryUri cdk-outputs.json)
REPOS_NAME=$(../cdk-output-parser.sh NeOneCdkStack$AREA_NAME appRepositoryName cdk-outputs.json)
REPOS=${REPOS_URI//$REPOS_NAME\//}
DB_READ_ENDPOINT=$(../cdk-output-parser.sh NeOneCdkStack$AREA_NAME db${AREA_NAME}readAddress cdk-outputs.json)
DB_WRITE_ENDPOINT=$(../cdk-output-parser.sh NeOneCdkStack$AREA_NAME db${AREA_NAME}writeAddress cdk-outputs.json)
OIDC_CLIENT_ID=$(../cdk-output-parser.sh NeOneCdkStack$AREA_NAME auth${AREA_NAME}appclientid cdk-outputs.json)
USERPOOL_ID=$(../cdk-output-parser.sh NeOneCdkStack$AREA_NAME auth${AREA_NAME}userPoolId cdk-outputs.json)
OIDC_ENDPOINT=$(../cdk-output-parser.sh NeOneCdkStack$AREA_NAME auth${AREA_NAME}providerurl cdk-outputs.json)
OIDC_CLIENT_SECRET=$(aws cognito-idp describe-user-pool-client --user-pool-id $USERPOOL_ID --client-id $OIDC_CLIENT_ID --query "UserPoolClient.ClientSecret" --output text)
# --profile=sigent+builder-Admin

aws ecr get-login-password --region $AWS_DEFAULT_REGION  | docker login --username AWS --password-stdin $REPOS

## HACK: app runner has issues with dns on first pull so use placeholder image
PLACEHOLDER_TAG=placeholder
docker pull testcontainers/helloworld:latest
docker tag testcontainers/helloworld:latest $REPOS_URI:$PLACEHOLDER_TAG
docker push $REPOS_URI:$PLACEHOLDER_TAG

docker pull git.openlogisticsfoundation.org:5050/wg-digitalaircargo/ne-one:dev
docker tag git.openlogisticsfoundation.org:5050/wg-digitalaircargo/ne-one:dev $REPOS_URI:$AREA_NAME
docker push $REPOS_URI:$AREA_NAME

cd ../ne-one-app-cdk

npm i

cdk bootstrap -c envName=$AREA_NAME

cdk deploy --require-approval never -c envName=$AREA_NAME -c tagName=placeholder --parameters appContainerRepositoryName=ne-one-app-dev \
    --parameters oidcClientId=$OIDC_CLIENT_ID \
    --parameters oidcClientSecret=$OIDC_CLIENT_SECRET \
    --parameters oidcEndpoint=$OIDC_ENDPOINT \
    --parameters dbReadEndpoint=$DB_READ_ENDPOINT \
    --parameters dbWriteEndpoint=$DB_WRITE_ENDPOINT \
    --trace --outputs-file ./cdk-app-outputs.json

cdk deploy --require-approval never -c envName=$AREA_NAME --parameters appContainerRepositoryName=ne-one-app-dev \
    --parameters oidcClientId=$OIDC_CLIENT_ID \
    --parameters oidcClientSecret=$OIDC_CLIENT_SECRET \
    --parameters oidcEndpoint=$OIDC_ENDPOINT \
    --parameters dbReadEndpoint=$DB_READ_ENDPOINT \
    --parameters dbWriteEndpoint=$DB_WRITE_ENDPOINT \
    --trace --outputs-file ./cdk-app-outputs.json