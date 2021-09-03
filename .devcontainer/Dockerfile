FROM node:14

ARG USERNAME=vscode
ARG USER_UID=1000
ARG USER_GID=$USER_UID

COPY migrations /src
WORKDIR /src
RUN yarn install 

FROM node:14


ARG USERNAME=vscode
ARG USER_UID=1000
ARG USER_GID=$USER_UID

COPY flag_initialization /src
WORKDIR /src
RUN yarn install

FROM node:14

ARG USERNAME=vscode
ARG USER_UID=1000
ARG USER_GID=$USER_UID

COPY . /src
WORKDIR /src

RUN yarn install 

FROM node:14
LABEL maintainer="-"

ARG USERNAME=vscode
ARG USER_UID=1000
ARG USER_GID=$USER_UID


WORKDIR /src

COPY --from=0 /src/node_modules ./migrations/node_modules
COPY --from=1 /src/node_modules ./flag_initialization/node_modules
COPY --from=2 /src/node_modules ./node_modules

ENV PORT 3000

EXPOSE 3000
