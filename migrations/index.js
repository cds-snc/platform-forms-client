require("dotenv").config();
const { createDb, migrate } = require("postgres-migrations");

const main = async function () {
  const dbConfig = {
    database: process.env.DB_NAME,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: 5432,
  };

  await createDb(process.env.DB_NAME, {
    ...dbConfig,
    defaultDatabase: "postgres", // defaults to "postgres"
  });
  await migrate(dbConfig, "./migrations");
};

main();
