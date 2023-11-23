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
docker tag testcontainers/helloworld:latest $AUTH_REPOS_URI:$PLACEHOLDER_TAG
docker push $AUTH_REPOS_URI:$PLACEHOLDER_TAG

docker pull git.openlogisticsfoundation.org:5050/wg-digitalaircargo/ne-one:dev
docker tag git.openlogisticsfoundation.org:5050/wg-digitalaircargo/ne-one:dev $APP_REPOS_URI:$AREA_NAME
docker push $APP_REPOS_URI:$AREA_NAME


cd ../ne-one-app-cdk

npm i

cdk bootstrap -c envName=$AREA_NAME

# HACK! Current script uses the same client secret so keeping it in the imported realm
CURRENT_SECRET=$(jq -r '.clients[] | select (.clientId=="neone-client") | .secret ' ../../docker-compose/keycloak/neone-realm.json)
CURRENT_LOGISTICS_URI=$(jq -r '.users[] | select (.username=="service-account-neone-client") | .attributes.logistics_agent_uri[0] ' ../../docker-compose/keycloak/neone-realm.json)

cdk deploy --require-approval never -c envName=$AREA_NAME -c tagName=placeholder --parameters appContainerRepositoryName=$APP_REPOS_NAME \
    --parameters authContainerRepositoryName=$AUTH_REPOS_NAME \
    --parameters dbReadEndpoint=$DB_READ_ENDPOINT \
    --parameters dbWriteEndpoint=$DB_WRITE_ENDPOINT \
    --parameters clientSecret=$CURRENT_SECRET \
    --trace --outputs-file ./cdk-app-placeholder-outputs.json

APP_SERVER_URI=$(../cdk-output-parser.sh NeOneAppCdkStack$AREA_NAME appServerUri cdk-app-placeholder-outputs.json)
NEW_LOGISTICS_URI="https://${APP_SERVER_URI}/logistics-objects/_data-holder"

sed -i "s#$CURRENT_LOGISTICS_URI#$NEW_LOGISTICS_URI#g" ../../docker-compose/keycloak/neone-realm.json

docker build -t $AUTH_REPOS_NAME:$AREA_NAME -f ../Dockerfile.auth ../..
docker tag $AUTH_REPOS_NAME:$AREA_NAME $AUTH_REPOS_URI:$AREA_NAME
docker push $AUTH_REPOS_URI:$AREA_NAME

n=0
until [ $n -ge 5 ]
do

    cdk deploy --require-approval never -c envName=$AREA_NAME --parameters appContainerRepositoryName=$APP_REPOS_NAME \
        --parameters authContainerRepositoryName=$AUTH_REPOS_NAME \
        --parameters dbReadEndpoint=$DB_READ_ENDPOINT \
        --parameters dbWriteEndpoint=$DB_WRITE_ENDPOINT \
        --parameters clientSecret=$CURRENT_SECRET \
        --parameters serverHost=$APP_SERVER_URI \
        --parameters serverPort=443 \
        --parameters serverProtocol=https \
        --trace --outputs-file ./cdk-app-outputs.json

    TEST_STRING=$(curl "https://${APP_SERVER_URI}")

    if [[ $TEST_STRING == *Hello* ]]; then
        n=$((n+1)) 
        echo "Attempt $n"
    else 
        echo "Success"
        break
    fi
    
done