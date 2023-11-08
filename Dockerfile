FROM node:18 as build
ENV NODE_ENV=production

COPY . /src
WORKDIR /src

ARG COGNITO_REGION="ca-central-1"
ARG COGNITO_APP_CLIENT_ID
ARG COGNITO_USER_POOL_ID

ARG INDEX_SITE="false"
ENV INDEX_SITE=$INDEX_SITE

RUN corepack enable && yarn set version berry
RUN yarn workspace gcforms install --immutable --silent
RUN yarn build
RUN yarn workspaces focus gcforms --production

FROM node:18 as final
LABEL maintainer="-"

ENV NODE_ENV=production

ARG COGNITO_REGION="ca-central-1"
ENV COGNITO_REGION=$COGNITO_REGION

ARG COGNITO_APP_CLIENT_ID
ENV COGNITO_APP_CLIENT_ID=$COGNITO_APP_CLIENT_ID

ARG COGNITO_USER_POOL_ID
ENV COGNITO_USER_POOL_ID=$COGNITO_USER_POOL_ID

ARG INDEX_SITE="false"
ENV INDEX_SITE=$INDEX_SITE

WORKDIR /src

# Update to latest yarn version
RUN corepack enable && yarn set version berry

COPY package.json yarn.lock .yarnrc.yml next-i18next.config.js next.config.js ./
COPY .yarn ./.yarn
COPY public ./public
COPY flag_initialization ./flag_initialization
COPY prisma ./prisma
COPY --from=build /src/node_modules ./node_modules
COPY --from=build /src/.next ./.next
COPY form-builder-templates ./form-builder-templates
RUN yarn workspace flag_initialization install


ENV PORT 3000

EXPOSE 3000

ENTRYPOINT [ "yarn", "start"]