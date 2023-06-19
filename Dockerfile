FROM node:16@sha256:07ac708c46cc7136db9d54749c541ba1dc516dc316e126a94136083b842c2db9

ENV NODE_ENV=production

COPY . /src
WORKDIR /src


ARG COGNITO_REGION="ca-central-1"
ARG COGNITO_APP_CLIENT_ID
ARG COGNITO_USER_POOL_ID

RUN yarn install --silent --production=false
RUN yarn build
RUN yarn install --production

FROM node:16@sha256:07ac708c46cc7136db9d54749c541ba1dc516dc316e126a94136083b842c2db9

COPY flag_initialization /src
WORKDIR /src
RUN yarn install --silent 

FROM node:16@sha256:07ac708c46cc7136db9d54749c541ba1dc516dc316e126a94136083b842c2db9
LABEL maintainer="-"

ARG GITHUB_SHA_ARG
ENV GITHUB_SHA=$GITHUB_SHA_ARG

ARG COGNITO_REGION="ca-central-1"
ENV COGNITO_REGION=$COGNITO_REGION

ARG COGNITO_APP_CLIENT_ID
ENV COGNITO_APP_CLIENT_ID=$COGNITO_APP_CLIENT_ID

ARG COGNITO_USER_POOL_ID
ENV COGNITO_USER_POOL_ID=$COGNITO_USER_POOL_ID

WORKDIR /src

COPY package.json yarn.lock ./

COPY --from=0 /src/node_modules ./node_modules
COPY --from=0 /src/.next ./.next
COPY public ./public
COPY next.config.js .
COPY next-i18next.config.js .
COPY prisma ./prisma
COPY form-builder-templates ./form-builder-templates
COPY flag_initialization ./flag_initialization
COPY --from=1 /src/node_modules ./flag_initialization/node_modules


ENV PORT 3000

EXPOSE 3000

ENTRYPOINT [ "yarn", "start"]