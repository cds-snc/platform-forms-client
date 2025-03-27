FROM node:22-alpine as base

ENV NODE_ENV=production
ENV NEXT_OUTPUT_STANDALONE=true
ENV NEXT_PUBLIC_ADDRESSCOMPLETE_API_KEY=UR78-BU29-RU35-EP49 

COPY . /src
WORKDIR /src

ARG COGNITO_APP_CLIENT_ID
ARG COGNITO_USER_POOL_ID

ARG INDEX_SITE="false"
ENV INDEX_SITE=$INDEX_SITE

ARG NEXT_DEPLOYMENT_ID
ENV NEXT_DEPLOYMENT_ID=$NEXT_DEPLOYMENT_ID

RUN corepack enable && yarn set version stable
RUN yarn workspaces focus gcforms flag_initialization
RUN yarn build
RUN yarn workspaces focus gcforms flag_initialization --production

FROM node:22-alpine as final
LABEL maintainer="-"

ENV PORT 3000
ENV NODE_ENV=production

ARG COGNITO_APP_CLIENT_ID
ENV COGNITO_APP_CLIENT_ID=$COGNITO_APP_CLIENT_ID

ARG COGNITO_USER_POOL_ID
ENV COGNITO_USER_POOL_ID=$COGNITO_USER_POOL_ID

ARG INDEX_SITE="false"
ENV INDEX_SITE=$INDEX_SITE

WORKDIR /src

COPY --from=base /src/public ./public
COPY --from=base /src/package.json ./package.json
COPY --from=base /src/.next/standalone ./
COPY --from=base /src/.next/static ./.next/static

EXPOSE 3000

CMD ["node", "server.js"]