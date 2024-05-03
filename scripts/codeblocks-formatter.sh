#!/bin/bash
cd "$(dirname $0)/.."

# If no arguments are passed, print usage and exit
if [ $# -eq 0 ]; then
    echo "Usage: $0 <markdown files directory>"
    exit 1
fi

npx prettier --config .prettierrc.yml --write "$1" --plugin='./scripts/custom-formatter.mjs'
# npx prettier --config .prettierrc.yml --write '../../../demo/' --plugin='./scripts/custom-formatter.mjs'
cd -
