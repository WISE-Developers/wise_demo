#!/bin/bash
# Load in configuration
cp -f config.sample.json /root/app_data/$HOST_JOBS_FOLDER/config.json
sed "s#JOBS-FOLDER-TEMPLATE#$HOST_JOBS_FOLDER#g" -i /root/app_data/$HOST_JOBS_FOLDER/config.json;
cp -f defaults.sample.json /root/app_data/$HOST_JOBS_FOLDER/defaults.json
ls -lha /root/app_data/$HOST_JOBS_FOLDER/;
