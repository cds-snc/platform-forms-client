[La version française suit.](#---------------------------------------------------------------------)

# Platform - GC Forms

This repository is the web application for the GC Forms platform product.

- Explore it here: [https://forms-staging.cdssandbox.xyz/](https://forms-staging.cdssandbox.xyz/).

## Built with

This is a [Next.js](https://nextjs.org/) and is built with:

- Next.js >= 16.x
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

Create an `.env.yarn` file at the root of the project and use the `.env.example` as a template. If you want you can find a ready to use version of the `.env` file in 1Password > Local Development .ENV secure note

### Run the web application in development mode

```sh
yarn dev
```

Browse web application on `http://localhost:3000`.

### Edit `@gcforms/core` styles locally

If you are changing styles in `packages/core/src/styles`, use the local `yalc` workflow to test the built package the same way it will be consumed after publish.

Build `@gcforms/core`, publish it to your local `yalc` store, and add or update it in this app:

```sh
yarn local:publish:core
```

Recommended review loop:

1. Edit the SCSS source in `packages/core/src/styles`.
2. Start the app with `yarn dev` if it is not already running.
3. Run `yarn local:publish:core` to rebuild and refresh the local published package.
4. Refresh the app and review the change in the browser.

Notes:

- This flow tests the built `@gcforms/core` package, not the workspace source directly.
- Generated files under `packages/core/styles/` are ignored by git and do not need to be committed.
- If the app is already running, use `yarn local:publish:core`; you do not need to restart `yarn dev` for every change unless Next fails to pick up the updated package.

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

See package.json scripts for vitest and playwright

### Local Playwright setup

For local development, the local Playwright scripts install Chromium automatically before running.

Playwight is configured to run "yarn build:test && yarn start:test" for the web server

### Running Playwright without resetting your dev schema

Local Playwright defaults to the isolated database path. The local scripts run `yarn db:test`, but they do it against a separate Playwright schema instead of your normal local development schema. That means your long-lived local users, templates, and feature flags are left alone. Use the local Playwright scripts:

```sh
yarn playwright:ui:local
```

or headless:

```sh
yarn playwright:headless:local
```

Those commands set `PLAYWRIGHT_ISOLATE_DB=true`, which keeps the same PostgreSQL server but rewrites the Prisma connection to use a separate schema named `playwright` by default. Your normal development schema is left alone.

These local scripts install Chromium first and then run Playwright against the local isolated-db mode. The remaining `playwright:headless:ci` script is kept for CI-style headless runs.

Reference:
Prisma PostgreSQL connection string arguments: https://www.prisma.io/docs/orm/overview/databases/postgresql
Prisma multi-schema support: https://www.prisma.io/docs/orm/prisma-schema/data-model/multi-schema

If you want a different schema name, set `PLAYWRIGHT_DB_SCHEMA`:

```sh
PLAYWRIGHT_DB_SCHEMA=your_schema yarn playwright:headless:local
```

To run a single Playwright test file:

```sh
yarn playwright:headless:local tests/e2e/smoke.spec.ts

```

or multiple

```bash
yarn playwright:headless:local tests/e2e/forms/required-attributes.spec.ts tests/e2e/navigation-focus.spec.ts tests/e2e/forms/attestation.spec.ts
```

To run a single test by name:

```sh
yarn playwright:headless:local --grep "should load the homepage and display expected content"
```

### Updating Browserslist data

If you see a Browserslist warning about stale `caniuse-lite` data, update it with:

```sh
npx update-browserslist-db@latest
```

This updates the dependency data in `yarn.lock`, so include the lockfile change in your commit.