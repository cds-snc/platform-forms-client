ARG VARIANT=16

FROM node:${VARIANT}

ARG USERNAME=node
ARG USER_UID=1000
ARG USER_GID=$USER_UID

COPY migrations /src
WORKDIR /src
RUN yarn install 

FROM node:${VARIANT}


ARG USERNAME=node
ARG USER_UID=1000
ARG USER_GID=$USER_UID

COPY flag_initialization /src
WORKDIR /src
RUN yarn install

FROM node:${VARIANT}

ARG USERNAME=node
ARG USER_UID=1000
ARG USER_GID=$USER_UID

COPY . /src
WORKDIR /src

RUN yarn install 

FROM mcr.microsoft.com/vscode/devcontainers/javascript-node:0-${VARIANT}
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

COPY --from=0 /src/node_modules ./migrations/node_modules
COPY --from=1 /src/node_modules ./flag_initialization/node_modules
COPY --from=2 /src/node_modules ./node_modules

ENV PORT 3000

ENV SHELL /bin/zsh

EXPOSE 3000
