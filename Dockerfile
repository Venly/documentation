# Dockerfile

# build stage
FROM node:lts-alpine as build-stage
RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh
WORKDIR /app
COPY package.json /app
RUN npm rebuild node-sass
RUN npm install
COPY . /app
RUN npm run build

# production stage
FROM nginx:1.13.12-alpine as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
