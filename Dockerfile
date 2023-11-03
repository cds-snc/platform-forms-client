FROM node:18
ENV NODE_ENV=production

COPY . /src
WORKDIR /src


ARG COGNITO_REGION="ca-central-1"
ARG COGNITO_APP_CLIENT_ID
ARG COGNITO_USER_POOL_ID

ARG INDEX_SITE="false"
ENV INDEX_SITE=$INDEX_SITE

RUN yarn install --silent --production=false
RUN yarn build
RUN yarn install --production

FROM node:18

COPY flag_initialization /src
WORKDIR /src
RUN yarn install --silent 

FROM node:18
LABEL maintainer="-"

ARG COGNITO_REGION="ca-central-1"
ENV COGNITO_REGION=$COGNITO_REGION

ARG COGNITO_APP_CLIENT_ID
ENV COGNITO_APP_CLIENT_ID=$COGNITO_APP_CLIENT_ID

ARG COGNITO_USER_POOL_ID
ENV COGNITO_USER_POOL_ID=$COGNITO_USER_POOL_ID

ARG INDEX_SITE="false"
ENV INDEX_SITE=$INDEX_SITE

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