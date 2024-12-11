FROM node:18

WORKDIR /usr/src/app

COPY ./server/package*.json ./server/

WORKDIR /usr/src/app/server
RUN npm install

WORKDIR /usr/src/app

COPY ./server ./server
COPY ./module ./module
COPY ./lib ./lib

EXPOSE 3000

CMD ["node", "server/index.js"]
