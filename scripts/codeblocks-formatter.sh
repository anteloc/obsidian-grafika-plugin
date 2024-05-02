#!/bin/bash
cd "$(dirname $0)/.."
npx prettier --config .prettierrc.yml --write '../../../demo/' --plugin='./scripts/custom-formatter.mjs'