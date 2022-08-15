FROM node:16

ENV NODE_ENV=production

COPY . /src
WORKDIR /src

ARG GOOGLE_CLIENT_ID
ARG GOOGLE_CLIENT_SECRET

RUN yarn install --silent --production=false
RUN yarn build
RUN yarn install --production

FROM node:16

COPY migrations /src
WORKDIR /src
RUN yarn install --silent 

FROM node:16

COPY flag_initialization /src
WORKDIR /src
RUN yarn install --silent 

FROM node:16
LABEL maintainer="-"

ARG GOOGLE_CLIENT_ID
ENV GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID

ARG GOOGLE_CLIENT_SECRET
ENV GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET

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
COPY prisma ./prisma
COPY flag_initialization ./flag_initialization
COPY --from=1 /src/node_modules ./migrations/node_modules
COPY --from=2 /src/node_modules ./flag_initialization/node_modules


ENV PORT 3000

EXPOSE 3000

ENTRYPOINT [ "yarn", "start"]