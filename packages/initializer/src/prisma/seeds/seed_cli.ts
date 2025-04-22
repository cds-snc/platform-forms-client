/* eslint-disable no-console */
import main from "./seed";
import { parse } from "ts-command-line-args";

async function cliWrapper() {
  const { environment = "production" } = parse<{ environment?: string }>({
    environment: { type: String, optional: true },
  });
  return environment;
}

cliWrapper()
  .then((environment) => main(environment))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
