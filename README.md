[La version française suit.](#---------------------------------------------------------------------)

# Platform - GC Forms

This repository is the web application for the GC Forms platform product.

- Explore it here: [https://forms-staging.cdssandbox.xyz/](https://forms-staging.cdssandbox.xyz/).

## Built with

This is a [Next.js](https://nextjs.org/) and is built with:

- Next.js >= 14.x
- Sass (Syntactically Awesome Style Sheets) for reusable styles
- [Tailwindcss](https://tailwindcss.com/) a utility-first css framework for rapidly building custom designs
- [PostCSS](https://postcss.org/)
- [Prisma](https://www.prisma.io/)

## Running locally

### Infrastructure setup

Clone the [forms-terraform repository](https://github.com/cds-snc/forms-terraform) and follow the instructions in our [README](https://github.com/cds-snc/forms-terraform/blob/develop/README.md) to launch the Localstack infrastructure locally.

```sh
git clone https://github.com/cds-snc/forms-terraform.git
```

### Web application setup

Clone this repository

```sh
git clone https://github.com/cds-snc/platform-forms-client.git
```

Install dependencies

```sh
cd platform-forms-client
yarn install
```

### Set your environment variables

Create an `.env` file at the root of the project and use the `.env.example` as a template. If you want you can find a ready to use version of the `.env` file in 1Password > Local Development .ENV secure note.

### Run the web application in development mode

```sh
yarn dev
```

Browse web application on `http://localhost:3000`.

### How to access databases

#### PostgreSQL GUI

A GUI manager is installed with prisma and can be launched with `yarn prisma:studio`
For more information about developing with prisma migrate please visit: https://www.prisma.io/docs/guides/database/developing-with-prisma-migrate

You can optionally install a GUI manager like pgAdmin4 ([MacOS download link](https://www.postgresql.org/ftp/pgadmin/pgadmin4/v8.4/macos/)) if you would like.
Here are the credentials to access your local PostgreSQL instance:

```
Hostname/Address: 127.0.0.1
Port: 4510
Maintenance database: forms
Username: localstack_postgres
Password: chummy
```

#### Redis GUI

You can download RedisInsight (see download link at the bottom of this [page](https://redis.com/redis-enterprise/redis-insight/)).

Here are the credentials to access your local Redis instance:

```
Host: localhost
Port: 6379
```

## Grant yourself admin access locally

There are several ways to connect to the database, but here's how to do it through Prisma Studio:

- Login using your Staging account
- Launch prisma studio with `yarn prisma:studio` or if you have prisma installed globally `prisma studio`
- A browser window will open at `localhost:5555`. Open the model `User`
- A table will appear. Find your username and add all the privileges under the `privileges` column.
- Click on "Save Change" button in the top menu bar once completed.

Once the change is made, you will need to 'Log Out' and log back in. Alternatively, if you want to avoid logging out, you can open RedisInsight and delete the key named `auth:privileges:<your_user_id>`. Then you just need to refresh the web application for the new privileges to be applied.

## Testing

This application uses Cypress for end-to-end testing.

When running tests, ensure you are not running 'yarn dev', instead run:

```
yarn build:test
yarn start:test
```

Otherwise you'll receive errors about `(uncaught exception)Error: Hydration failed because the initial UI does not match what was rendered on the server.`

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

# Traduction en français à venir...
