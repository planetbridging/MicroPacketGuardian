# Dockerfile
FROM node:20

# Create app directory
WORKDIR /usr/src/app

# Install libpcap-dev
RUN apt-get update && apt-get install -y libpcap-dev

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

RUN npm install

# Bundle app source
COPY . .

EXPOSE 3012
EXPOSE 58123
EXPOSE 3011


CMD [ "node", "index.js" ]
