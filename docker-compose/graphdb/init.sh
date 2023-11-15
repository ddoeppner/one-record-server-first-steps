#!/bin/bash

NEONE_REPO_HTTP_STATUS=$(curl -o /dev/null -s -w '%{http_code}' -i http://graph-db:7200/rest/repositories/"$NEONE_REPO_ID")

if [ "$NEONE_REPO_HTTP_STATUS" -eq "404" ]; then
    echo "Creating neone repository $NEONE_REPO_ID"
    curl -X POST --header 'Content-Type:multipart/form-data' -F 'config=@/opt/neone/graphdb/neone-repository.ttl' 'http://graph-db:7200/rest/repositories'    
elif [ "$NEONE_REPO_HTTP_STATUS" -eq "200" ]; then
  echo "Repository already exixts"
else
  echo "Error creating repository - Server returned $NEONE_REPO_HTTP_STATUS for repo $NEONE_REPO_ID"
  exit 1
fi
