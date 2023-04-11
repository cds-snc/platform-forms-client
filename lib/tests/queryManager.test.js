import executeQuery from "../integration/queryManager";
import dbConnector from "../integration/dbConnector";

//Mocking db connector client
jest.mock("../integration/dbConnector", () => {
  const dbClient = {
    connect: jest.fn(),
    query: jest.fn(),
    end: jest.fn(),
  };
  return jest.fn(() => dbClient);
});

describe("Testing queryManager and dbConnector", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("Should query the db and return an object", async () => {
    const client = dbConnector("postgres://test:test@localhost:5432/test");
    client.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
    const result = await executeQuery(
      client,
      "SELECT bearer_token FROM templates WHERE id = ($1)",
      [1]
    );
    expect(result).toEqual({ rows: [], rowCount: 0 });
  });

  it("Should throw an error because there's an invalid/empty query parameter", async () => {
    const client = dbConnector("postgres://test:test@localhost:5432/test");
    try {
      await executeQuery(client, "");
    } catch (error) {
      expect(error).toBeDefined();
    } finally {
      //Shouldn't call connect
      expect(client.connect).toBeCalledTimes(0);
    }
  });
});
