import queryManager from "../integration/queryManager";
import dbConnector from "../integration/dbConnector";

jest.mock("../integration/dbConnector", () => {
  const mClient = {
    connect: jest.fn(),
    query: jest.fn(),
    end: jest.fn(),
  };
  return jest.fn(() => mClient);
});

describe("Testing queryManager and dbConnector", () => {
  let client;
  afterEach(() => {
    jest.clearAllMocks();
  });
  it("Should connect and execute a query", async () => {
    client = dbConnector("postgres://test:test@localhost:5432/test");
    await queryManager.executeQuery("SELECT bearer_token FROM templates WHERE id = ($1)", []);
    expect(client.connect).toBeCalledTimes(1);
    expect(client.query).toBeCalledTimes(1);
  });

  it("Should query the db and return an object", async () => {
    client = dbConnector("postgres://test:test@localhost:5432/test");
    client.query.mockResolvedValueOnce({ rows: [], rowCount: 1 });
    const result = await queryManager.executeQuery(
      "SELECT bearer_token FROM templates WHERE id = ($1)",
      [1]
    );
    expect.assertions(result);
  });

  it("Should throw an error b/c an Invalid query param", async () => {
    client = dbConnector("postgres://test:test@localhost:5432/test");
    expect(async function () {
      await queryManager.executeQuery("");
    }).rejects.toBeTruthy();
  });
});
