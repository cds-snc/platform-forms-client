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

For local development of the NextJS application but leveraging the AWS backend (Reliability Queue, Templates DB, etc.)

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
```

For local development of the complete solution (running SAM for local Lambdas) add the following two environment variables to your .env file and see the instructions for launching the Lambda's locally in our [Infrastructure ReadME](https://github.com/cds-snc/forms-staging-terraform)

```
LOCAL_LAMBDA_ENDPOINT=http://127.0.0.1:3001
DATABASE_URL=postgres://postgres:password@localhost:5432/formsDB
```

Start Redis in docker locally

```sh
docker-compose up -d redis
```

Set up local database (only if you want to run the project in isolation)

Run postgres by using the following command

```sh
docker-compose up -d db
```

You can optionally install a gui manager like PgAdmin if you would like.

in `/migrations`, fill in the separate .env file.

```
DB_NAME=formsDB
DB_USERNAME=postgres
DB_PASSWORD=chummy
DB_HOST=localhost
```

Note if running in devcontainers on vscode the DB_HOST should be of value `db`

inside the `/migrations` folder, run `node index.js` to run migrations against the local database.

In your main forms .env file, DATABASE_URL can be filled in as followed (replace values in {} with the values you used in your migrations env file)
`DATABASE_URL=postgres://{DB_USERNAME}:{DB_PASSWORD}@DB_HOST:5432/{DB_NAME}`

As an example, here's the DB string with the example values from above:
`DATABASE_URL=postgres://postgres:password@localhost:5432/formsDB`

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

Pour le développement local de l'application NextJS mais en s'appuyant sur le backend AWS (File d'attente de fiabilité, DB de modèles, etc.)

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
```

Pour le développement local de la solution complète (exécutant SAM pour les Lambda locaux), ajoutez les deux variables d'environnement suivantes à votre fichier .env et consultez les instructions pour lancer les Lambda localement dans notre [Infrastructure ReadME] (https://github.com/cds -snc/forms-staging-terraform)

```
LOCAL_LAMBDA_ENDPOINT=http://127.0.0.1:3001
DATABASE_URL=postgres://postgres:password@localhost:5432/formsDB
```

Démarrer Redis dans docker localement

```sh
docker run --name local-redis -p 6379:6379 -d redis:alpine
```

Configurer la base de données locale (uniquement si vous souhaitez exécuter le projet de manière isolée)

- Assurez-vous que postgres est installé et en cours d'exécution sur votre machine locale
- Installez un gestionnaire d'interface graphique comme PgAdmin si vous le souhaitez (facultatif)

dans `/migrations`, remplissez le fichier .env séparé.
Exemples de valeurs :

```
DB_NAME=formsDB
DB_USERNAME=postgres
DB_PASSWORD=password
DB_HOST=localhost
```

dans le dossier `/migrations`, exécutez `node index.js` pour exécuter des migrations sur la base de données locale.

Dans votre fichier .env de formulaires principaux, DATABASE_URL peut être rempli comme suit (remplacez les valeurs dans {} par les valeurs que vous avez utilisées dans votre fichier env de migrations)
`DATABASE_URL=postgres://{DB_USERNAME}:{DB_PASSWORD}@DB_HOST:5432/{DB_NAME}`

À titre d'exemple, voici la chaîne de base de données avec les exemples de valeurs ci-dessus :
`DATABASE_URL=postgres://postgres:password@localhost:5432/formsDB`

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
