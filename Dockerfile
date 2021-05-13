FROM node:14-alpine

ARG PRODUCTION_ENV=false
ENV PRODUCTION_ENV=${PRODUCTION_ENV}

COPY . /src
WORKDIR /src

RUN yarn install --silent --production=false
RUN yarn build
RUN yarn install --production

FROM node:14-alpine

COPY migrations /src
WORKDIR /src

RUN yarn install --silent 

FROM node:14-alpine
LABEL maintainer="-"

ARG GITHUB_SHA_ARG
ENV GITHUB_SHA=$GITHUB_SHA_ARG

ARG TAG_VERSION
ENV TAG_VERSION=$TAG_VERSION

ARG PRODUCTION_ENV=false
ENV PRODUCTION_ENV=${PRODUCTION_ENV}

ENV NODE_ENV=production

WORKDIR /src

COPY package.json yarn.lock ./

COPY --from=0 /src/node_modules ./node_modules
COPY --from=0 /src/.next ./.next
COPY public ./public
COPY next.config.js .
COPY next-i18next.config.js .
COPY migrations ./migrations
COPY --from=1 /src/node_modules ./migrations/node_modules


ENV PORT 3000

EXPOSE 3000

ENTRYPOINT [ "yarn", "start"]