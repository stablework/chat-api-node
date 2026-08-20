#!/bin/bash

set -e
env=${NODE_ENV:-development}

# install npm packages
npm install

echo "============"
echo " COMPLETED  "
echo "============"

# build commands
npm start