FROM node:14-alpine
COPY . /src
WORKDIR /src
RUN yarn install --silent --production=false
RUN yarn build
RUN yarn install --production

FROM node:14-alpine
LABEL maintainer="-"

ARG GITHUB_SHA_ARG
ENV GITHUB_SHA=$GITHUB_SHA_ARG

ARG TAG_VERSION
ENV TAG_VERSION=$TAG_VERSION
ENV NODE_ENV=production
ENV GA_ACTIVE=true

WORKDIR /src

COPY package.json yarn.lock ./

COPY --from=0 /src/node_modules ./node_modules
COPY --from=0 /src/.next ./.next
COPY public ./public
COPY next.config.js .

ENV PORT 3000

EXPOSE 3000

ENTRYPOINT [ "yarn", "start"]