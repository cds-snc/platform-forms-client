import { getUsers, adminRole } from "@lib/users";
import executeQuery from "@lib/integration/queryManager";

jest.mock("@lib/integration/queryManager");

jest.mock("@lib/integration/dbConnector", () => {
  const mockClient = {
    connect: jest.fn(),
    query: jest.fn(),
    end: jest.fn(),
  };
  return jest.fn(() => mockClient);
});

describe("User query tests should fail gracefully", () => {
  beforeEach(() => {
    executeQuery.mockImplementation(() => {
      throw new Error("Sabotaged");
    });
  });
  it("getUsers should fail silenty", async () => {
    const result = await getUsers();
    expect(result).toHaveLength(0);
  });
  it("adminRole should fail gracefully", async () => {
    const result = await adminRole(false, 4);
    expect(result).toEqual([false, false]);
  });
});

describe("User query test returns correct values", () => {
  afterEach(() => {
    executeQuery.mockReset();
  });
  it("Returns a list of users", async () => {
    executeQuery.mockReturnValue({
      rows: [
        { id: 3, name: "user_1", admin: false },
        { id: 3, name: "user_2", admin: true },
      ],
      rowCount: 2,
    });
    const result = await getUsers();
    expect(result).toMatchObject([
      { id: 3, name: "user_1", admin: false },
      { id: 3, name: "user_2", admin: true },
    ]);
  });
  it("Modifies an adminitrator", async () => {
    executeQuery.mockReturnValue({
      rows: [{ id: 3, name: "user_1", admin: false }],
      rowCount: 1,
    });
    const result = await adminRole(false, 2);
    const args = executeQuery.mock.calls[0][2];
    expect(args).toMatchObject(["false", "2"]);
    expect(result).toBeTruthy();
  });
});
