#!/bin/bash
# Load in configuration
   # sh -c "npm run  copy-configs";
    sh -c "npm run  builderonly";
    sh -c "npm run  test-builder";
    sh -c "npm run  test-service";