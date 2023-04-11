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
    const client = await dbConnector("postgres://test:test@localhost:5432/test");
    // Try to connect
    expect(client.connect).toBeCalledTimes(1);
  });

  it("Should throw an error reason: there's no db configuration string found.", async () => {
    try {
      await dbConnector();
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it("Should successfully return a connection client with Env configuration settings. ", async () => {
    process.env = Object.assign(process.env, {
      DATABASE_URL: "postgres://test:test@localhost:5542/test",
    });
    const client = await dbConnector();
    expect(client.connect).toBeCalledTimes(1);
    process.env = Object.assign(process.env, { DATABASE_URL: undefined });
  });
});
