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
yarn install
```

Set .env variables

```
NOTIFY_API_KEY= // Can be found in LastPass
SUBMISSION_API=Submission
TEMPLATES_API=Templates
ORGANISATIONS_API=Organisations
AWS_ACCESS_KEY_ID= // Can be found in LastPass
AWS_SECRET_ACCESS_KEY= // Can be found in LastPass
GOOGLE_CLIENT_ID= // Can be found in LastPass
GOOGLE_CLIENT_SECRET= // Can be found in LastPass
NEXTAUTH_URL=http://localhost:3000
REDIS_URL=localhost
DATABASE_URL= // See "Set up local database" section
```

Set up local database

- Make sure you have postgres installed and running on your local machine
- Install a gui manager like PgAdmin if you would like (optional)

in `/migrations`, fill in the separate .env file.
Example values:

```
DB_NAME=formsDB
DB_USERNAME=postgres
DB_PASSWORD=password
DB_HOST=localhost
```

inside the `/migrations` folder, run `node index.js` to run migrations against the local database.

In your main forms .env file, DATABASE_URL can be filled in as followed (replace values in {} with the values you used in your migrations env file)
`DATABASE_URL=postgres://{DB_USERNAME}:{DB_PASSWORD}@DB_HOST:5432/{DB_NAME}`

As an example, here's the DB string with the example values from above:
`DATABASE_URL=postgres://postgres:password@localhost:5432/formsDB`

Start Redis in docker locally

```sh
docker run --name local-redis -p 6379:6379 -d redis:alpine
```

Run in development mode:

```sh
yarn dev
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

## Exécuter localement

Cloner ce référentiel

```sh
git clone https://github.com/cds-snc/platform-forms-client.git
```

Installer les dépendances

```sh
cd platform-forms-client
yarn install
```

Définir les variables .env

```
NOTIFY_API_KEY= // Peut être trouvé dans LastPass
SUBMISSION_API=Submission
TEMPLATES_API=Templates
ORGANISATIONS_API=Organisations
AWS_ACCESS_KEY_ID= // Peut être trouvé dans LastPass
AWS_SECRET_ACCESS_KEY= // Peut être trouvé dans LastPass
GOOGLE_CLIENT_ID= // Peut être trouvé dans LastPass
GOOGLE_CLIENT_SECRET= // Peut être trouvé dans LastPass
NEXTAUTH_URL=http://localhost:3000
REDIS_URL=localhost
DATABASE_URL= // TO TRANSLATE
```

Démarrer Redis dans docker localement

```sh
docker run --name local-redis -p 6379:6379 -d redis:alpine
```

Exécuter en mode développement

```sh
yarn dev
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
