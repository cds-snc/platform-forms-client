FROM node:14-alpine

ENV NODE_ENV=production

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

COPY flag_initialization /src
WORKDIR /src
RUN yarn install --silent 

FROM node:14-alpine
LABEL maintainer="-"

ARG GITHUB_SHA_ARG
ENV GITHUB_SHA=$GITHUB_SHA_ARG

ARG TAG_VERSION
ENV TAG_VERSION=$TAG_VERSION


WORKDIR /src

COPY package.json yarn.lock ./

COPY --from=0 /src/node_modules ./node_modules
COPY --from=0 /src/.next ./.next
COPY public ./public
COPY next.config.js .
COPY next-i18next.config.js .
COPY migrations ./migrations
COPY flag_initialization ./flag_initialization
COPY --from=1 /src/node_modules ./migrations/node_modules
COPY --from=2 /src/node_modules ./flag_initialization/node_modules


ENV PORT 3000

EXPOSE 3000

ENTRYPOINT [ "yarn", "start"]