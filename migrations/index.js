/* eslint-disable no-console */
require("dotenv").config();
const { createDb, migrate } = require("postgres-migrations");
const { logMessage } = require("../lib/logger");
var parse = require("pg-connection-string").parse;

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
    logMessage.debug("Running Migrations");
    await createDb(dbConfig.database, {
      ...dbConfig,
      defaultDatabase: "postgres", // defaults to "postgres"
    });
    await migrate(dbConfig, "./migrations");
  } else {
    logMessage.debug("No Database Configured");
  }
};

main();
