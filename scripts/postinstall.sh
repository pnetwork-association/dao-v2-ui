#!/bin/bash
echo "Starting postinstall ..."

echo "1. Installing husky ..."
npx husky install

echo "2. Patch npm packages"
npx patch-package