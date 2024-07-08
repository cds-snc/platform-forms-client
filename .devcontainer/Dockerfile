FROM node:20@sha256:93d2e801dabc677ea0b30b47d3d729fab63ecb20be7ac0ab204cc3c65731297a

ARG USERNAME=node
ARG USER_UID=1000
ARG USER_GID=$USER_UID

COPY flag_initialization /src
COPY .yarn /src/.yarn
COPY .yarnrc.yml /src
WORKDIR /src
RUN yarn install

FROM node:20@sha256:93d2e801dabc677ea0b30b47d3d729fab63ecb20be7ac0ab204cc3c65731297a

ARG USERNAME=node
ARG USER_UID=1000
ARG USER_GID=$USER_UID

COPY . /src
WORKDIR /src

RUN yarn install

FROM mcr.microsoft.com/vscode/devcontainers/javascript-node:0-20@sha256:a20adf8775b442587c7fe3d5ce6f2f2bc084cd4e9dacc27b1a2d0840f28e57c9
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
