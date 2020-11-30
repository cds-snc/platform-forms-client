FROM node:12-alpine
LABEL maintainer="-"

ARG GITHUB_SHA_ARG
ENV GITHUB_SHA=$GITHUB_SHA_ARG

ARG TAG_VERSION
ENV TAG_VERSION=$TAG_VERSION
ENV NODE_ENV=production

COPY . /src

WORKDIR /src

RUN npm install --quiet --production

EXPOSE 3000

ENTRYPOINT [ "npm", "start" ]