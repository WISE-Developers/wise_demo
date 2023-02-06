# PSaaS Requires Ubuntu Focal while Builder does not.
FROM ubuntu:jammy-20221130

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
	openjdk-17-jre \
	htop \
	build-essential \ 
	zip \
	unzip \
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
#RUN mkdir -p /tmp/PSaaS/
# download and copy the installer archive into the project for decompression
#RUN curl -fsSL https://spyd.com/fgm.ca/WISE_Ubuntu_2022.03-01.sh -o /tmp/PSaaS/PSaaS.sh; 
# RUN ls -lha ./
# COPY ./PSaaS_*.sh /tmp/PSaaS/PSaaS.sh
#RUN set -eux; \
#	sh  /tmp/PSaaS/PSaaS.sh --noexec --target /tmp/PSaaS; \
#	ls -lha /tmp/PSaaS; \
#	cp /tmp/PSaaS/PSaaS_Builder.jar /usr/bin; \
#	cp /tmp/PSaaS/defaults.json /usr/bin; \
#	cp -r /tmp/PSaaS/PSaaS_Builder_lib /usr/bin/PSaaS_Builder_lib; 

# Install the psaas binaries.
# RUN apt install -y /tmp/PSaaS/PSaaS_2022.03-01.deb 
# RUN rm -rf /tmp/PSaaS;
# WORKDIR /usr/src/app

#install WISE 1.0 beta
RUN mkdir -p /tmp/WISE/
RUN mkdir -p /tmp/builder/
# RUN curl -fsSL https://github.com/WISE-Developers/WISE_Application/releases/download/w1.0.0-beta/wise-ubuntu2204-1.0.0-beta.deb -o /tmp/WISE/wise-ubuntu2204-1.0.0-beta.deb; 
# trick to get the latest wise-ubuntu2204 deb
RUN eval wget $(curl -s https://api.github.com/repos/WISE-Developers/WISE_Application/releases/latest  | grep browser_download_url | grep ubuntu2204 | cut -d : -f 2,3) -o /tmp/WISE/wise-ubuntu2204.deb

# trick to get the latest builder
RUN eval wget $(curl -s https://api.github.com/repos/WISE-Developers/WISE_Builder_Component/releases/latest  | grep browser_download_url | cut -d : -f 2,3) -o  /tmp/builder/latest_builder.zip


# RUN curl -fsSL https://github.com/WISE-Developers/WISE_Builder_Component/releases/download/Builder_1.0.0-beta/WISE_Builder-0.0.beta.zip -o /tmp/builder/WISE_Builder-0.0.beta.zip; 
RUN unzip /tmp/builder/latest_builder.zip -d /tmp/builder/
RUN set -eux; \
	unzip -o /tmp/builder/latest_builder.zip -d /tmp/builder/; \
	ls -lha /tmp/builder; \
	cp /tmp/builder/WISE_Builder.jar /usr/bin; \
	cp -r /tmp/builder/WISE_Builder_lib /usr/bin/WISE_Builder_lib; 
RUN apt install -y wise-ubuntu2204.deb
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

