FROM node:16@sha256:8c3c7e253d9484a35ed9db3e6ba296d859a382f48602d0321e4734a91311ac95

ENV NODE_ENV=production

COPY . /src
WORKDIR /src


ARG COGNITO_REGION="ca-central-1"
ARG COGNITO_APP_CLIENT_ID
ARG COGNITO_USER_POOL_ID

RUN yarn install --silent --production=false
RUN yarn build
RUN yarn install --production

FROM node:16@sha256:8c3c7e253d9484a35ed9db3e6ba296d859a382f48602d0321e4734a91311ac95

COPY flag_initialization /src
WORKDIR /src
RUN yarn install --silent 

FROM node:16@sha256:8c3c7e253d9484a35ed9db3e6ba296d859a382f48602d0321e4734a91311ac95
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