# PSaaS Requires Ubuntu Focal while Builder does not.
FROM ubuntu:focal

SHELL ["/bin/bash", "-o", "pipefail", "-c"]

# setup timezone - the timezone where this modeler sits
ARG TZ=$timezone
ENV TZ = $TZ

RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Gather Args (Passed ENV vars from the host)



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
RUN curl -fsSL https://spyd.com/fgm.ca/WISE_Ubuntu_2022.03-01.sh -o /tmp/PSaaS/PSaaS.sh; 
# RUN ls -lha ./
# COPY ./PSaaS_*.sh /tmp/PSaaS/PSaaS.sh
RUN set -eux; \
	sh  /tmp/PSaaS/PSaaS.sh --noexec --target /tmp/PSaaS; \
	ls -lha /tmp/PSaaS; \
	cp /tmp/PSaaS/PSaaS_Builder.jar /usr/bin; \
	cp /tmp/PSaaS/defaults.json /usr/bin; \
	cp -r /tmp/PSaaS/PSaaS_Builder_lib /usr/bin/PSaaS_Builder_lib; 

# Install the psaas binaries.
RUN apt install -y /tmp/PSaaS/PSaaS_2022.03-01.deb 
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
RUN npm config set psaas-js-api:job_directory=/usr/src/app/wisedemo/wisejobs
RUN echo "Copying files...."
# Bundle app source
COPY . .
COPY config.sample.json /usr/src/app/wisedemo/wisejobs/config.json
COPY defaults.sample.json /usr/src/app/wisedemo/wisejobs/defaults.json

# Configure the terminal
COPY aliasshell.sh /bin/aliasshell.sh
COPY install.bashrc /root/.bashrc
SHELL ["/bin/aliasshell.sh"]

# This script will modify the WISE/PSAAS config.json with ENV Vars.
# CMD [ "node","copyvars.js" ]

# Launch builder and GUI to run in the background.
CMD ["npm", "run", "model"]

