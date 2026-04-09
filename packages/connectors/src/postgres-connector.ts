import { getAwsSecret } from "./utils";
import postgres, { Sql } from "postgres";

export class PostgresConnector {
  private postgresInstance: Sql;

  public static defaultUsingPostgresJsonConnectionObjectFromAwsSecret(
    secretArn: string
  ): Promise<PostgresConnector> {
    return getAwsSecret(secretArn).then((value) => {
      if (value === undefined) {
        throw new Error("Postgres JSON connection object is undefined");
      }

      return new PostgresConnector(value);
    });
  }

  private constructor(jsonConnectionObject: string) {
    this.postgresInstance = postgres(JSON.parse(jsonConnectionObject));
  }

  public executeSqlStatement(): Sql {
    return this.postgresInstance;
  }
}
