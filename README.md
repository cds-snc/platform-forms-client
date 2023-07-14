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
- [Prisma](https://www.prisma.io/)

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
AWS_ACCESS_KEY_ID= // Can be found in LastPass
AWS_SECRET_ACCESS_KEY= // Can be found in LastPass
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

A GUI manager is installed with prisma and can be launched with `yarn prisma:studio`
You can optionally install a gui manager like PgAdmin if you would like.
For more information about developing with prisma migrate please visit: https://www.prisma.io/docs/guides/database/developing-with-prisma-migrate

In your main forms .env file, DATABASE_URL can be filled in as followed (replace values in {} with the values you used in your migrations env file)
`DATABASE_URL=postgres://{DB_USERNAME}:{DB_PASSWORD}@DB_HOST:5432/{DB_NAME}`

As an example, here's the DB string with the example values from above:
`DATABASE_URL=postgres://postgres:chummy@localhost:5432/formsDB`

Run in development mode:

```sh
yarn dev
```

Browse application on `http://localhost:3000`

## Configuration

There are some environment variables that can optionally be configured. You can see a list in `.env.example`.

### Grant yourself admin access locally

There are 2 ways to connect to the database. Either directly using PGAdmin or a PSQL cli tool or through Prisma Studio. Once the change is made you will need to "Log Out" using the

## Connect to DataBase Directly

- Login using your email via Google SSO
- Connect to the local database `psql -h db -U postgres -d formsDB`
- Retrieve your users id from the User table in the formsDB `SELECT * FROM "public"."User" WHERE email='$YOUR_EMAIL';`
- Update the record to elevate yourself as an admin `UPDATE "public"."User" SET role='ADMINISTRATOR' WHERE id='$YOUR_ID';`

## Prisma Studio

- Login using your email via Google SSO
- Launch prisma studio with `yarn prisma:studio` or if you have prisma installed globally `prisma studio`
- A browser window will open at `localhost:5555`. Open the model `User`
- A table will appear. Find your username in the list and double-click on the value under the `role` column to modify to "ADMINISTRATOR".
- Click on "Save Change" button in the top menu bar once completed.

## Testing

This application uses Cypress for end-to-end testing.

If you want to clear the database and run the tests in a clean slate:

```
yarn dev:test # run in a separate terminal
```

If you want to run a specific test:

```
yarn cypress:e2e --spec "PATH_TO_TEST"
```

If you want to run the entire test suite:

```
yarn cypress:e2e
# an error? see the screenshot in ./cypress/screenshots
```

If a test is failing, you can run the test tool:

```
yarn cypress
# A chrome instance starts, then manually start and watch that test running
```

The application also uses Jest for unit testing. To run the tests, run `yarn test`.

### Notify integration

To send a form submission to an email address, you should configure the following environment variables in a `.env` file:

```sh
NOTIFY_API_KEY=
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
AWS_ACCESS_KEY_ID= // Can be found in LastPass
AWS_SECRET_ACCESS_KEY= // Can be found in LastPass
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
