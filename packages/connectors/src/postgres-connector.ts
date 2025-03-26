import { getAwsSecret } from "./getAwsSecret";
import postgres, { Sql } from "postgres";

export class PostgresConnector {
  private postgresInstance: Sql;

  public static defaultUsingPostgresConnectionUrlFromAwsSecret(
    postgresConnectionUrlSecretIdentifier: string
  ): Promise<PostgresConnector> {
    return getAwsSecret(postgresConnectionUrlSecretIdentifier).then((postgresConnectionUrl) => {
      if (postgresConnectionUrl === undefined) {
        throw new Error("Postgres connection URL is undefined");
      }

      return new PostgresConnector(postgresConnectionUrl);
    });
  }

  private constructor(connectionUrl: string) {
    this.postgresInstance = postgres(connectionUrl);
  }

  public executeSqlStatement(): Sql {
    return this.postgresInstance;
  }
}
