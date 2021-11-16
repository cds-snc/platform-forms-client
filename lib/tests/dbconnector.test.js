import dbConnector from "../integration/dbConnector";

jest.mock("pg", () => {
  const mClient = {
    connect: jest.fn(),
    query: jest.fn(),
    end: jest.fn(),
  };
  return { Client: jest.fn(() => mClient) };
});

describe("Testing dbConnector", () => {
  let client;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("Should create and return a valid client", async () => {
    client = dbConnector("postgres://test:test@localhost:5432/test");
    // Try to connect
    client.connect();
    expect(client.connect).toBeCalledTimes(1);
    //Verify query method
    client.query("SELECT bearer_token FROM templates;", []);
    expect(client.query).toBeCalledTimes(1);
  });

  it("Should throw an error reason: there's no db configuration string found.", async () => {
    expect(async function () {
      dbConnector(); // must throw Error("Invalid db configuration string")
    }).rejects.toBeTruthy();
  });

  it("Should successfuly return a connexion client with Env configuration settings. ", async () => {
    process.env = Object.assign(process.env, {
      DATABASE_URL: "postgres://test:test@localhost:5542/test",
    });
    const client = dbConnector();
    client.connect();
    expect(client.connect).toBeCalledTimes(1);
    process.env = Object.assign(process.env, { DATABASE_URL: undefined });
  });
});
