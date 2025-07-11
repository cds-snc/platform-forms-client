FROM node:22-alpine as base

ENV NODE_ENV=production
ENV NEXT_OUTPUT_STANDALONE=true
ENV NEXT_PUBLIC_ADDRESSCOMPLETE_API_KEY=UR78-BU29-RU35-EP49 

# 10 MB --- alllow more for the main deployment
ENV NEXT_PUBLIC_BODY_SIZE_LIMIT_WITH_FILES=10485760

COPY . /src
WORKDIR /src

ARG COGNITO_APP_CLIENT_ID
ARG COGNITO_USER_POOL_ID

ARG INDEX_SITE="false"
ENV INDEX_SITE=$INDEX_SITE

ARG NEXT_DEPLOYMENT_ID
ENV NEXT_DEPLOYMENT_ID=$NEXT_DEPLOYMENT_ID

ARG HCAPTCHA_SITE_KEY
ENV NEXT_PUBLIC_HCAPTCHA_SITE_KEY=$HCAPTCHA_SITE_KEY

RUN corepack enable && yarn set version stable
RUN yarn workspaces focus gcforms
RUN yarn build
RUN yarn workspaces focus gcforms --production

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