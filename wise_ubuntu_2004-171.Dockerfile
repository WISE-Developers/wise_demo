# PSaaS Requires Ubuntu Focal while Builder does not.
FROM ubuntu:focal-20230126


SHELL ["/bin/bash", "-o", "pipefail", "-c"]

# setup timezone - the timezone where this modeler sits
ARG DEMO_TIMEZONE
ENV TZ $DEMO_TIMEZONE

ARG HOST_JOBS_FOLDER
ENV HOST_JOBS_FOLDER $HOST_JOBS_FOLDER

RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Gather Args (Passed ENV vars from the host)

# install missing utilities
# RUN apt-get update && apt-get install -y gnupg
# sort out some keys
# RUN apt-key adv --keyserver keyserver.ubuntu.com --recv-keys 871920D1991BC93C

#Install Java and other software into the container
RUN apt-get update -qq && apt-get install -qq --no-install-recommends \
	openjdk-16-jre \
	htop \
	zip \
	unzip \
	software-properties-common \ 
	dirmngr \ 
	curl \
	apt-transport-https \
	nano \ 
	wget \
	&& rm -rf /var/lib/apt/lists/*

# Install NPM and NODEJS
RUN curl -fsSL https://deb.nodesource.com/setup_16.x | bash -
RUN apt install -y nodejs 

#install WISE 1.0 beta
RUN mkdir -p /tmp/WISE/
RUN mkdir -p /tmp/builder/

# trick to get the latest wise-ubuntu2004 deb
RUN DA_LATEST_APP=$(curl -s https://api.github.com/repos/WISE-Developers/WISE_Application/releases/latest  | grep browser_download_url | grep ubuntu2004 | cut -d : -f 2,3 | tr -d '"') ; wget $DA_LATEST_APP -O /tmp/WISE/wise-ubuntu2004.deb


# trick to get the latest builder
RUN DA_LATEST_BUILDER=$(curl -s https://api.github.com/repos/WISE-Developers/WISE_Builder_Component/releases/latest  | grep browser_download_url | cut -d : -f 2,3 | tr -d '"') ; wget $DA_LATEST_BUILDER -O /tmp/builder/latest_builder.zip

RUN unzip /tmp/builder/latest_builder.zip -d /tmp/builder/
RUN set -eux; \
	unzip -o /tmp/builder/latest_builder.zip -d /tmp/builder/; \
	ls -lha /tmp/builder; \
	cp /tmp/builder/WISE_Builder.jar /usr/bin; \
	cp -r /tmp/builder/WISE_Builder_lib /usr/bin/WISE_Builder_lib; 
RUN ls -lha /tmp/WISE/	
RUN apt install -y /tmp/WISE/wise-ubuntu2004.deb
RUN rm -rf /tmp/builder;
RUN rm -rf /tmp/WISE;
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
RUN npm config set psaas-js-api:job_directory=/usr/src/app/wisedemo/$HOST_JOBS_FOLDER
RUN echo "Copying files.... to /usr/src/app/wisedemo/$HOST_JOBS_FOLDER"
# Bundle app source
COPY . .
COPY config.sample.json /usr/src/app/wisedemo/$HOST_JOBS_FOLDER/config.json
COPY defaults.sample.json /usr/src/app/wisedemo/$HOST_JOBS_FOLDER/defaults.json

# Configure the terminal
COPY aliasshell.sh /bin/aliasshell.sh
COPY install.bashrc /root/.bashrc
SHELL ["/bin/aliasshell.sh"]

# This script will modify the WISE/PSAAS config.json with ENV Vars.
# CMD [ "node","copyvars.js" ]

# Launch builder and GUI to run in the background.
CMD ["npm", "run", "test-wise"]

