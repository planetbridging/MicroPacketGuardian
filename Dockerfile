FROM node:14-alpine

ENV NODE_VERSION 16.14.2
RUN apk add --no-cache nodejs npm python3 make g++ libpcap-dev nodejs-dev
WORKDIR /app


COPY . /app



RUN npm install


EXPOSE 80
EXPOSE 443


ENTRYPOINT ["node"]

CMD ["index.js"]