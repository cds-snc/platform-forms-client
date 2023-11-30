FROM node:18@sha256:a17842484dd30af97540e5416c9a62943c709583977ba41481d601ecffb7f31b as build
ENV NODE_ENV=production

COPY . /src
WORKDIR /src

ARG COGNITO_REGION="ca-central-1"
ARG COGNITO_APP_CLIENT_ID
ARG COGNITO_USER_POOL_ID

ARG INDEX_SITE="false"
ENV INDEX_SITE=$INDEX_SITE

RUN corepack enable && yarn set version berry
RUN yarn workspaces focus gcforms flag_initialization
RUN yarn build
RUN yarn workspaces focus gcforms flag_initialization --production

FROM node:18@sha256:a17842484dd30af97540e5416c9a62943c709583977ba41481d601ecffb7f31b as final
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

COPY package.json yarn.lock .yarnrc.yml next-i18next.config.js next.config.js ./
COPY .yarn ./.yarn
# Update to latest yarn version
RUN corepack enable && yarn set version berry
COPY public ./public
COPY prisma ./prisma
COPY flag_initialization ./flag_initialization
COPY --from=build /src/node_modules ./node_modules
COPY --from=build /src/.next ./.next
COPY form-builder-templates ./form-builder-templates



ENV PORT 3000

EXPOSE 3000

ENTRYPOINT [ "yarn", "start"]