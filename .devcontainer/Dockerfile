FROM node:16@sha256:6cd6581a9ae814ebbc8077afd63ecbf4d37f9b59ac9d9304a1b5a9e743ac13e0


ARG USERNAME=node
ARG USER_UID=1000
ARG USER_GID=$USER_UID

COPY flag_initialization /src
WORKDIR /src
RUN yarn install

FROM node:16@sha256:6cd6581a9ae814ebbc8077afd63ecbf4d37f9b59ac9d9304a1b5a9e743ac13e0

ARG USERNAME=node
ARG USER_UID=1000
ARG USER_GID=$USER_UID

COPY . /src
WORKDIR /src

RUN yarn install 

FROM mcr.microsoft.com/vscode/devcontainers/javascript-node:0-16@sha256:4e8ea446290f6b2456e4bd4de6d2ea966059c28c08a2defeec830b0a90e8a275
LABEL maintainer="-"

ARG USERNAME=node
ARG USER_UID=1000
ARG USER_GID=$USER_UID

# Install packages
RUN apt-get update \
    && apt-get -y install --no-install-recommends \
        apt-utils \
        postgresql-client \
        2>&1 \
    && apt-get -y install \
        zsh \
    && apt-get autoremove -y \
    && apt-get clean -y \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /src

COPY --from=0 /src/node_modules ./flag_initialization/node_modules
COPY --from=1 /src/node_modules ./node_modules

ENV PORT 3000

ENV SHELL /bin/zsh

EXPOSE 3000
