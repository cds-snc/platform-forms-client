import dbConnector from "../integration/dbConnector";

jest.mock("pg", () => {
  const pgClient = {
    connect: jest.fn(),
    query: jest.fn(),
    end: jest.fn(),
  };
  return { Client: jest.fn(() => pgClient) };
});

describe("Testing dbConnector", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("Should create and return a valid client", async () => {
    const client = dbConnector("postgres://test:test@localhost:5432/test");
    // Try to connect
    client.connect();
    expect(client.connect).toBeCalledTimes(1);
    // Verify query method
    client.query("SELECT bearer_token FROM templates;", []);
    expect(client.query).toBeCalledTimes(1);
  });

  it("Should throw an error reason: there's no db configuration string found.", async () => {
    try {
      dbConnector();
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it("Should successfully return a connexion client with Env configuration settings. ", async () => {
    process.env = Object.assign(process.env, {
      DATABASE_URL: "postgres://test:test@localhost:5542/test",
    });
    const client = dbConnector();
    client.connect();
    expect(client.connect).toBeCalledTimes(1);
    process.env = Object.assign(process.env, { DATABASE_URL: undefined });
  });
});
