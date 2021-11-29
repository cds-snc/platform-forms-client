import { createMocks } from "node-mocks-http";
import client from "next-auth/client";
import owners from "../../../../pages/api/id/[form]/owners";
import executeQuery from "../../../../lib/integration/queryManager";

jest.mock("next-auth/client");
jest.mock("../../../../lib/integration/queryManager");

jest.mock("../../../../lib/integration/dbConnector", () => {
  const mClient = {
    connect: jest.fn(),
    query: jest.fn(),
    end: jest.fn(),
  };
  return jest.fn(() => mClient);
});

describe("/id/[forms]/owners", () => {
  describe("GET: Retrieve list of emails API endpoint", () => {
    it("Shouldn't allow a request without a valid session", async () => {
      client.getSession.mockReturnValue(undefined);

      const { req, res } = createMocks({
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        query: {
          form: "1",
        },
      });

      await owners(req, res);
      expect(res.statusCode).toBe(403);
      expect(JSON.parse(res._getData())).toEqual(
        expect.objectContaining({ error: "Access Denied" })
      );
    });

    it("Should return an error 'Malformed API Request'", async () => {
      const mockSession = {
        expires: "1",
        user: { email: "forms@cds.ca", name: "forms user" },
      };

      client.getSession.mockReturnValue(mockSession);
      const { req, res } = createMocks({
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:3000",
        },
        query: {
          form: "",
        },
      });

      await owners(req, res);
      expect(JSON.parse(res._getData()).error).toEqual("Malformed API Request FormID not define");
      expect(res.statusCode).toBe(400);
    });

    it("Should return all the emails associated with the form ID.", async () => {
      const mockSession = {
        expires: "1",
        user: { email: "forms@cds.ca", name: "forms user" },
      };
      client.getSession.mockReturnValue(mockSession);
      // Mocking executeQuery to return a list of emails
      executeQuery.mockReturnValue({
        rows: [
          { id: "1", email: "test@cds.ca", active: true },
          { id: "2", email: "forms@cds.ca", active: false },
        ],
        rowCount: 2,
      });
      const { req, res } = createMocks({
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:3000/api/id/89/owners",
        },
        query: {
          form: "89",
        },
      });
      await owners(req, res);
      expect(JSON.parse(res._getData())).toEqual(
        expect.objectContaining([
          { id: "1", email: "test@cds.ca", active: true },
          { id: "2", email: "forms@cds.ca", active: false },
        ])
      );
      expect(res.statusCode).toBe(200);
    });

    it("Should return a list that contains only one email", async () => {
      const mockSession = {
        expires: "1",
        user: { email: "forms@cds.ca", name: "forms user" },
      };
      client.getSession.mockReturnValue(mockSession);
      // Mocking executeQuery to return a list with only an email
      executeQuery.mockReturnValue({
        rows: [{ id: "1", email: "oneEmail@cds.ca", active: true }],
        rowCount: 1,
      });
      const { req, res } = createMocks({
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:3000/api/id/1/owners",
        },
        query: {
          form: "1",
        },
      });
      await owners(req, res);
      expect(JSON.parse(res._getData())).toEqual(
        expect.objectContaining([{ id: "1", email: "oneEmail@cds.ca", active: true }])
      );
      expect(res.statusCode).toBe(200);
    });

    it("Should return 404 form ID can't be found or a form has no emails associated", async () => {
      const mockSession = {
        expires: "1",
        user: { email: "forms@cds.ca", name: "forms user" },
      };
      client.getSession.mockReturnValue(mockSession);
      // Mocking executeQuery to return an empty list
      executeQuery.mockReturnValue({ rows: [], rowCount: 0 });

      const { req, res } = createMocks({
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        query: {
          form: "99",
        },
      });

      await owners(req, res);
      expect(res.statusCode).toBe(404);
      expect(JSON.parse(res._getData())).toEqual(
        expect.objectContaining({ error: "Form Not Found" })
      );
    });

    it("Should return 500 as statusCode if there's db's error", async () => {
      const mockSession = {
        expires: "1",
        user: { email: "forms@cds.ca", name: "forms" },
      };
      client.getSession.mockReturnValue(mockSession);
      // Mocking executeQuery to throw an error
      executeQuery.mockImplementation(() => {
        throw new Error("Error");
      });

      const { req, res } = createMocks({
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:3000/api/id/33/owners",
        },
        query: {
          form: "33",
        },
      });

      await owners(req, res);
      expect(res.statusCode).toBe(500);
      expect(JSON.parse(res._getData()).error).toEqual("Error on Server Side");
    });
  });

  describe("PUT: Activate and deactivate a form's owners API endpoint", () => {
    it("Should return 400 invalid payload error(active) field/value is missing", async () => {
      const mockSession = {
        expires: "1",
        user: { email: "forms@cds.ca", name: "forms" },
      };
      client.getSession.mockReturnValue(mockSession);
      const { req, res } = createMocks({
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:3000/api/id/11/owners",
        },
        body: JSON.stringify({
          email: "forms@cds.ca",
          active: "",
        }),
        query: {
          form: "11",
        },
      });
      await owners(req, res);
      expect(res.statusCode).toBe(400);
      expect(JSON.parse(res._getData())).toEqual(
        expect.objectContaining({ error: "Invalid payload fields are not define" })
      );
    });

    it("Should return 400 invalid payload error(email) field/value is missing", async () => {
      const mockSession = {
        expires: "1",
        user: { email: "forms@cds.ca", name: "forms" },
      };
      client.getSession.mockReturnValue(mockSession);

      const { req, res } = createMocks({
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "",
          active: "1",
        }),
        query: {
          form: "20",
        },
      });
      await owners(req, res);
      expect(res.statusCode).toBe(400);
      expect(JSON.parse(res._getData())).toEqual(
        expect.objectContaining({ error: "Invalid payload fields are not define" })
      );
    });

    it("Should return 404 Form or email Not Found in form_users", async () => {
      const mockSession = {
        expires: "1",
        user: { email: "forms@cds.ca", name: "forms" },
      };
      // Mocking executeQuery it returns 0 updated rows
      executeQuery.mockReturnValue({ rows: [], rowCount: 0 });

      client.getSession.mockReturnValue(mockSession);
      const { req, res } = createMocks({
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "forms@cds.ca",
          active: "1",
        }),
        query: {
          form: "10",
        },
      });
      await owners(req, res);
      expect(res.statusCode).toBe(404);
      expect(JSON.parse(res._getData())).toEqual(
        expect.objectContaining({ error: "Form or email Not Found" })
      );
    });
    test.each([0, 1])(
      "Should return 200 status code: owners are deactivated/activated",
      async (elem) => {
        const mockSession = {
          expires: "1",
          user: { email: "forms@cds.ca", name: "forms" },
        };
        client.getSession.mockReturnValue(mockSession);

        //Mocking executeQuery
        executeQuery.mockReturnValue({ rows: [{ id: 1 }], rowCount: `${elem}` + 1 });
        const { req, res } = createMocks({
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "forms@cds.ca",
            active: `${elem}`,
          }),
          query: {
            form: "12",
          },
        });
        await owners(req, res);
        expect(res.statusCode).toBe(200);
        expect(JSON.parse(res._getData())).toEqual(expect.objectContaining([{ id: 1 }]));
      }
    );
    it("Should return 400 with invalid field value: active must be 1/0 or true/false", async () => {
      const mockSession = {
        expires: "1",
        user: { email: "forms@cds.ca", name: "forms" },
      };
      client.getSession.mockReturnValue(mockSession);

      const { req, res } = createMocks({
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "forms@cds-snc.ca",
          active: "adfasf",
        }),
        query: {
          form: "3",
        },
      });
      await owners(req, res);
      expect(res.statusCode).toBe(400);
      expect(JSON.parse(res._getData())).toEqual(
        expect.objectContaining({ error: "Invalid field value: active must be 1/0 or true/false" })
      );
    });
  });
});
