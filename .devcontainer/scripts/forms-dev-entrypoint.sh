#!/bin/bash
set -ex 

###################################################################
# This script will get executed *once* the Docker container has 
# been built. Commands that need to be executed with all available
# tools and the filesystem mount enabled should be located here. 
###################################################################

cd /src 
yarn install --production=false

cd /src/migrations

FILE=.env

if [ ! -f "$FILE" ]; then
cat <<EOF >> .env
DB_NAME=formsDB
DB_USERNAME=postgres
DB_PASSWORD=chummy
DB_HOST=db
EOF
fi

yarn install
node index.js
