/* eslint-disable no-console */
require("dotenv").config();
const { createDb, migrate } = require("postgres-migrations");
const { Client } = require("pg");
var parse = require("pg-connection-string").parse;

const checkMigrationStatus = async (dbConfig) => {
  try {
    // Check if Migrations table exists.
    // If so then we need to complete the migration to Prisma
    const pgClient = new Client({ ...dbConfig });
    await pgClient.connect();
    const tableExists = await pgClient.query(
      "SELECT EXISTS ( SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename  = 'migrations');"
    );

    await pgClient.end();
    return Boolean(tableExists.rows[0].exists);
  } catch (e) {
    console.error(e);
  }
};

const main = async function () {
  let dbConfig = {
    database: process.env.DB_NAME,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: 5432,
  };

  if (process.env.DATABASE_URL) {
    dbConfig = parse(process.env.DATABASE_URL);
    dbConfig.port = parseInt(dbConfig.port);
  }
  if (dbConfig.host && dbConfig.database) {
    const legacyMigration = await checkMigrationStatus(dbConfig);

    if (!legacyMigration) {
      console.log("Already Migrated to Prisma or New Install");
      return;
    }

    console.log("Running Migrations");
    await createDb(dbConfig.database, {
      ...dbConfig,
      defaultDatabase: "postgres", // defaults to "postgres"
    });
    await migrate(dbConfig, "./migrations");
  } else {
    console.log("No Database Configured");
  }
};

main();
