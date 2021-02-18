[La version française suit.](#---------------------------------------------------------------------)

# Platform - GC Forms

This repository is work-in-progress for the GC Forms platform product. "Alpha" will be arriving in Spring 2021.

- Explore it here: [https://forms-staging.cdssandbox.xyz/](https://forms-staging.cdssandbox.xyz/).
- View our UI inventory and documentation on [Storybook](https://cds-snc.github.io/platform-forms-client/?path=/story/introduction--page)

## Built with

This is a [Next.js](https://nextjs.org/) and is built with:

- Next.js >= 10.x
- Sass (Syntactically Awesome Style Sheets) for reusable styles
- [Tailwindcss](https://tailwindcss.com/) a utility-first css framework for rapidly building custom designs
- [PostCSS](https://postcss.org/)

## Running locally

Clone this repository

```sh
git clone https://github.com/cds-snc/platform-forms-client.git
```

Install dependencies

```sh
cd platform-forms-client
yarn install // or // npm install
```

Run in development mode:

```sh
yarn dev // or // npm run dev
```

Browse application on `http://localhost:3000`

## Configuration

There are some environment variables that can optionally be configured. You can see a list in `.env.example`.

### Notify integration

To send a form submission to an email address, you should configure the following environment variables in a `.env` file:

```sh
NOTIFY_API_KEY=
```

### Debugging

For verbose debug logging set an environment variable called DEBUG to `true` before running `yarn dev`
ex. `DEBUG=true yarn dev`

### Storybook

- In order to run Storybook localy, type `yarn storybook`
- It can also be deployed to the `gh-pages` branch automatically using [storybook-deployer](https://github.com/storybookjs/storybook-deployer) via the command:

```sh
cd platform-forms-client
yarn deploy-storybook
```

## ---------------------------------------------------------------------

# Plate-forme - Formulaires GC

Ce dépôt est un travail en cours pour le produit de la plate-forme GC Forms. "Alpha" arrivera au printemps 2021.

- Explorez le ici : [https://forms-staging.cdssandbox.xyz/](https://forms-staging.cdssandbox.xyz/).
- Explorez le [Storybook](https://cds-snc.github.io/platform-forms-client/?path=/story/introduction--page)

## Contributions

Ce projet est conçu sur une de base [Next.js](https://nextjs.org/) et utilise les contributions suivantes :

- Next.js >= 10.x
- Feuilles de styles Sass (Syntactically Awesome Style Sheets)
- [Tailwindcss](https://tailwindcss.com/) un environnement CSS modulaire accélérant la conception de pages web
- [PostCSS](https://postcss.org/)

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app) and is built with:

- Next.js >= 10.x
- Sass (Syntactically Awesome Style Sheets) for reusable styles
- [Tailwindcss](https://tailwindcss.com/) a utility-first css framework for rapidly building custom designs
- [PostCSS](https://postcss.org/)

## Exécuter localement

Cloner ce référentiel

```sh
git clone https://github.com/cds-snc/platform-forms-client.git
```

Installer les dépendances

```sh
cd platform-forms-client
yarn install // ou // npm install
```

Exécuter en mode développement

```sh
yarn dev // or // npm run dev
```

Accéder à l’application au `http://localhost:3000`

## Configuration

Certaines valeurs d'environnement peuvent être configurés. Cette étape est optionnelle. Consultez la liste des valeurs disponibles dans `.env.example`.

### Intégration avec Notify

Pour envoyer les réponses d'une formulaire à une adresse courriel, vous devez configurer les variables suivantes :

```sh
NOTIFY_API_KEY=
```

### Débougage

Pour des logs plus verbose en fin de débougage, définissez une variable d'environnement appelée DEBUG comme `true` avant d'exécuter` yarn dev`
ex. `DEBUG=true yarn dev`

### Storybook

- Pour voir Storybook exécutez `yarn storybook`
- Pour deployer a `gh-pages` avec [storybook-deployer](https://github.com/storybookjs/storybook-deployer) exécutez:

```sh
cd platform-forms-client
yarn deploy-storybook
```
