# PSaaS Requires Ubuntu Focal while Builder does not.
FROM ubuntu:focal

SHELL ["/bin/bash", "-o", "pipefail", "-c"]

# setup timezone - the timezone where this modeler sits
ENV TZ=America/Yellowknife
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Gather Args (Passed ENV vars from the host)

ARG PSAAS_7_ENGINE_VERSION
ARG PSAAS_7_DISTRIBUTION_LINK
ARG PSAAS_INTERNAL_JOBS_FOLDER
ARG PORT
ARG EDITION

# ARG PSAAS_BUILDER_MQTT_TOPIC
# ARG PSAAS_EXTERNAL_JOBS_FOLDER
# ARG PSAAS_BUILDER_HOST
# ARG PSAAS_BUILDER_PORT
# ARG PSAAS_BUILDER_MQTT_HOST 
# ARG PSAAS_BUILDER_MQTT_PORT
# ARG PSAAS_BUILDER_MQTT_TOPIC
# ARG PSAAS_BUILDER_MQTT_USER 
# ARG PSAAS_BUILDER_MQTT_PASS 
# ARG PSAAS_BUILDER_MQTT_QOS 
# ARG  CONTAINER_DATASET_PATH 
# ARG  CONTAINER_DATASET_BBOXFILE 
# ARG  CONTAINER_DATASET_LUTFILE 
# ARG  CONTAINER_DATASET_PROJFILE 
# ARG  CONTAINER_DATASET_ELEVATION_RASTER 
# ARG  CONTAINER_DATASET_FUEL_RASTER 
# ARG  PERIMETER_DISPLAY_INTERVAL_HOURS 
# ARG  MODEL_TIMZEONE_OFFSET 
# ARG  PSAAS_INTERNAL_RAIN_FOLDER 
# ARG  PSAAS_PROJECT_JOBS_FOLDER 
# ARG  CONTAINER_PSAAS_BIN_PATH 

#Install Java and other software into the container
RUN apt-get update -qq && apt-get install -qq --no-install-recommends \
	openjdk-16-jre \
	htop \
	build-essential \ 
	zip \
	software-properties-common \ 
	dirmngr \ 
	curl \
	apt-transport-https \
	nano \ 
	&& rm -rf /var/lib/apt/lists/*

# Install NPM and NODEJS
RUN curl -fsSL https://deb.nodesource.com/setup_16.x | bash -
RUN apt install -y nodejs 

# Install PSaaS
# setup and decompress the psaas installer.
RUN mkdir -p /tmp/PSaaS/
# download and copy the installer archive into the project for decompression
RUN curl -fsSL ${PSAAS_7_DISTRIBUTION_LINK} -o /tmp/PSaaS/PSaaS.sh; 
# RUN ls -lha ./
# COPY ./PSaaS_*.sh /tmp/PSaaS/PSaaS.sh
RUN set -eux; \
	sh  /tmp/PSaaS/PSaaS.sh --noexec --target /tmp/PSaaS; \
	ls -lha /tmp/PSaaS; \
	cp /tmp/PSaaS/PSaaS_Builder.jar /usr/bin; \
	cp /tmp/PSaaS/defaults.json /usr/bin; \
	cp -r /tmp/PSaaS/PSaaS_Builder_lib /usr/bin/PSaaS_Builder_lib; 

# Install the psaas binaries.
RUN apt install -y /tmp/PSaaS/PSaaS_${PSAAS_7_ENGINE_VERSION}.deb 
RUN rm -rf /tmp/PSaaS;
WORKDIR /usr/src/app

# work around bug in openssl (remove the last line in config)
# allows FETCH to use SSL otherwise secure connections fail
RUN head -n -1 /etc/ssl/openssl.cnf > temp.txt ; mv temp.txt /etc/ssl/openssl.cnf

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

# Install NodeJS Dependancies
RUN npm install

# set job directory for this PSAAS container
RUN npm config set psaas-js-api:job_directory=${PSAAS_INTERNAL_JOBS_FOLDER}

# Bundle app source
COPY . .
COPY config.sample.json ${PSAAS_INTERNAL_JOBS_FOLDER}/config.json
COPY defaults.sample.json ${PSAAS_INTERNAL_JOBS_FOLDER}/defaults.json

# Configure the terminal
COPY aliasshell.sh /bin/aliasshell.sh
COPY install.bashrc /root/.bashrc
SHELL ["/bin/aliasshell.sh"]

# This script will modify the WISE/PSAAS config.json with ENV Vars.
# CMD [ "node","copyvars.js" ]

# Launch builder and GUI to run in the background.
CMD ["npm", "run", "model"]

