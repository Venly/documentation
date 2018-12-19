# Dockerfile

FROM node:10.14.2-alpine

RUN npm config set registry https://registry.npmjs.org/
WORKDIR /app
COPY package.json /app
RUN npm install
COPY . /app
RUN npm run build

ENV NODE_ENV=production

ENV PORT=5000

CMD npm run serve

EXPOSE $PORT