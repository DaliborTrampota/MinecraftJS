FROM node:20

WORKDIR /app

COPY server/package*.json /app/server/
WORKDIR /app/server
RUN npm install --production

COPY server /app/server

CMD ["node", "--env-file=.env", "index.js"]