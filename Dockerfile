FROM node:22-alpine as build
ENV NODE_ENV=production
ENV NEXT_PUBLIC_ADDRESSCOMPLETE_API_KEY=UR78-BU29-RU35-EP49 

COPY . /src
WORKDIR /src

ARG COGNITO_APP_CLIENT_ID
ARG COGNITO_USER_POOL_ID

ARG INDEX_SITE="false"
ENV INDEX_SITE=$INDEX_SITE

ARG NEXT_SERVER_ACTIONS_ENCRYPTION_KEY
ENV NEXT_SERVER_ACTIONS_ENCRYPTION_KEY=$NEXT_SERVER_ACTIONS_ENCRYPTION_KEY

RUN corepack enable && yarn set version berry
RUN yarn workspaces focus gcforms flag_initialization
RUN yarn build
RUN yarn workspaces focus gcforms flag_initialization --production

FROM node:22-alpine as final
LABEL maintainer="-"

ENV NODE_ENV=production

ARG COGNITO_APP_CLIENT_ID
ENV COGNITO_APP_CLIENT_ID=$COGNITO_APP_CLIENT_ID

ARG COGNITO_USER_POOL_ID
ENV COGNITO_USER_POOL_ID=$COGNITO_USER_POOL_ID

ARG INDEX_SITE="false"
ENV INDEX_SITE=$INDEX_SITE

ARG NEXT_SERVER_ACTIONS_ENCRYPTION_KEY
ENV NEXT_SERVER_ACTIONS_ENCRYPTION_KEY=$NEXT_SERVER_ACTIONS_ENCRYPTION_KEY

WORKDIR /src

COPY package.json yarn.lock .yarnrc.yml next.config.mjs ./
COPY .yarn ./.yarn
# Update to latest yarn version
RUN corepack enable && yarn set version berry
COPY public ./public
COPY prisma ./prisma
COPY flag_initialization ./flag_initialization
COPY --from=build /src/node_modules ./node_modules
COPY --from=build /src/.next ./.next



ENV PORT 3000

EXPOSE 3000

ENTRYPOINT [ "yarn", "start"]