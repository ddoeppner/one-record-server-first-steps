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
AUTH_REPOS_URI=$(../cdk-output-parser.sh NeOneCdkStack$AREA_NAME authRepositoryUri cdk-outputs.json)
AUTH_REPOS_NAME=$(../cdk-output-parser.sh NeOneCdkStack$AREA_NAME authRepositoryName cdk-outputs.json)
AUTH_REPOS=${AUTH_REPOS_URI//$AUTH_REPOS_NAME\//}
APP_REPOS_URI=$(../cdk-output-parser.sh NeOneCdkStack$AREA_NAME appRepositoryUri cdk-outputs.json)
APP_REPOS_NAME=$(../cdk-output-parser.sh NeOneCdkStack$AREA_NAME appRepositoryName cdk-outputs.json)
APP_REPOS=${APP_REPOS_URI//$APP_REPOS_NAME\//}
DB_READ_ENDPOINT=$(../cdk-output-parser.sh NeOneCdkStack$AREA_NAME db${AREA_NAME}readAddress cdk-outputs.json)
DB_WRITE_ENDPOINT=$(../cdk-output-parser.sh NeOneCdkStack$AREA_NAME db${AREA_NAME}writeAddress cdk-outputs.json)

aws ecr get-login-password --region $AWS_DEFAULT_REGION  | docker login --username AWS --password-stdin $AUTH_REPOS
aws ecr get-login-password --region $AWS_DEFAULT_REGION  | docker login --username AWS --password-stdin $APP_REPOS

## HACK: app runner has issues with dns on first pull so use placeholder image
PLACEHOLDER_TAG=placeholder
docker pull testcontainers/helloworld:latest
docker tag testcontainers/helloworld:latest $APP_REPOS_URI:$PLACEHOLDER_TAG
docker push $APP_REPOS_URI:$PLACEHOLDER_TAG

docker pull git.openlogisticsfoundation.org:5050/wg-digitalaircargo/ne-one:dev
docker tag git.openlogisticsfoundation.org:5050/wg-digitalaircargo/ne-one:dev $APP_REPOS_URI:$AREA_NAME
docker push $APP_REPOS_URI:$AREA_NAME

cd ..
docker build -t $AUTH_REPOS_NAME:$AREA_NAME -f ./Dockerfile.auth ..
docker tag $AUTH_REPOS_NAME:$AREA_NAME $AUTH_REPOS_URI:$AREA_NAME
docker push $AUTH_REPOS_URI:$AREA_NAME

cd ne-one-app-cdk

npm i

cdk bootstrap -c envName=$AREA_NAME

cdk deploy --require-approval never -c envName=$AREA_NAME -c tagName=placeholder --parameters appContainerRepositoryName=$APP_REPOS_NAME \
    --parameters authContainerRepositoryName=$AUTH_REPOS_NAME \
    --parameters dbReadEndpoint=$DB_READ_ENDPOINT \
    --parameters dbWriteEndpoint=$DB_WRITE_ENDPOINT \
    --trace --outputs-file ./cdk-app-outputs.json

cdk deploy --require-approval never -c envName=$AREA_NAME --parameters appContainerRepositoryName=$APP_REPOS_NAME \
    --parameters authContainerRepositoryName=$AUTH_REPOS_NAME \
    --parameters dbReadEndpoint=$DB_READ_ENDPOINT \
    --parameters dbWriteEndpoint=$DB_WRITE_ENDPOINT \
    --trace --outputs-file ./cdk-app-outputs.json