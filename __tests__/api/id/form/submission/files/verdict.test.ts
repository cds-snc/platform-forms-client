import { createMocks, RequestMethod } from "node-mocks-http";
import verdict, { isValidQueryParam } from "@pages/api/id/[form]/[submission]/files/verdict";
import { getFileAttachments, getFileScanVerdict } from "@lib/fileAttachments";
import { getFormSubmission } from "@lib/formSubmission";
import { prismaMock } from "@jestUtils";
import jwt, { Secret } from "jsonwebtoken";

jest.mock("@lib/fileAttachments");
const mockGetFileAttachments = jest.mocked(getFileAttachments, true);
const mockGetFileScanVerdict = jest.mocked(getFileScanVerdict, true);

jest.mock("@lib/formSubmission");
const mockGetFormSubmission = jest.mocked(getFormSubmission, true);

// Temp tokens used to test the middleware
const secret = "much-amaze-so-secret";
const tokenValid = jwt.sign(
  {
    email: "valid@cds-snc.ca",
    formID: 1,
  },
  secret as Secret,
  {
    expiresIn: "1y",
  }
);
const tokenInvalid = jwt.sign(
  {
    email: "invalid@cds-snc.ca",
    formID: 2,
  },
  secret as Secret,
  {
    expiresIn: "1y",
  }
);

// Helper functions to mock responses for the tests
const mockFormUser = (token: string) => {
  prismaMock.formUser.findUnique.mockResolvedValue({
    id: "1",
    templateId: "1",
    email: "valid@cds-snc.ca",
    active: true,
    temporaryToken: token,
    created_at: new Date(),
    updated_at: new Date(),
  });
};
const mockFormSubmission = (formSubmission: string | undefined) => {
  mockGetFormSubmission.mockImplementation(() => Promise.resolve(formSubmission));
};
const mockFileAttachments = (attachments: { fileName: string; path?: string }[]) => {
  mockGetFileAttachments.mockImplementation(() => attachments);
};
const mockFileScanVerdict = (scanVerdict: { [tag: string]: string } | undefined) => {
  mockGetFileScanVerdict.mockImplementation(() => Promise.resolve(scanVerdict));
};

beforeEach(() => {
  jest.resetAllMocks();
});

describe("/id/[forms]/[submission]/files/verdict", () => {
  beforeAll(() => {
    process.env.TOKEN_SECRET = secret;
  });

  afterAll(() => {
    delete process.env.TOKEN_SECRET;
  });

  describe("Middleware: cors", () => {
    test.each(["POST", "PUT", "PATCH", "DELETE"])(
      "Should not allow %s requests",
      async (httpVerb) => {
        const { req, res } = createMocks({ method: httpVerb as RequestMethod });
        await verdict(req, res);
        expect(res.statusCode).toBe(403);
        expect(JSON.parse(res._getData())).toMatchObject({ error: "HTTP Method Forbidden" });
      }
    );
  });

  describe("Middleware: validTemporaryToken", () => {
    it("Should fail if there is no temporary token", async () => {
      const { req, res } = createMocks({
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        query: {
          form: "1",
        },
      });
      await verdict(req, res);
      expect(res.statusCode).toBe(403);
      expect(JSON.parse(res._getData())).toMatchObject({
        error: "Missing or invalid bearer token or unknown error.",
      });
    });

    it("Should fail if the temporary token is invalid", async () => {
      mockFormUser(tokenValid);
      const { req, res } = createMocks({
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${tokenInvalid}`,
        },
        query: {
          form: "1",
        },
      });
      await verdict(req, res);
      expect(res.statusCode).toBe(403);
      expect(JSON.parse(res._getData())).toMatchObject({
        error: "Missing or invalid bearer token.",
      });
    });
  });

  describe("Middleware: validQueryParams", () => {
    it("Should fail if the query params are invalid", async () => {
      mockFormUser(tokenValid);

      const { req, res } = createMocks({
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${tokenValid}`,
        },
        query: {
          form: "1",
          submission: "",
        },
      });
      await verdict(req, res);
      expect(res.statusCode).toBe(400);
      expect(JSON.parse(res._getData())).toMatchObject({
        error: "Unable to validate query parameters.",
      });
    });
  });

  describe("Middleware: validFormSubmission", () => {
    it("Should fail if a form submission is not found", async () => {
      mockFormUser(tokenValid);
      mockFormSubmission(undefined);

      const { req, res } = createMocks({
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${tokenValid}`,
        },
        query: {
          form: "1",
          submission: "2",
        },
      });
      await verdict(req, res);
      expect(res.statusCode).toBe(400);
      expect(JSON.parse(res._getData())).toMatchObject({
        error:
          "Unable to check form submission is valid. Please check your form ID and submission ID.",
      });
    });
  });

  describe("Endoint handler", () => {
    beforeEach(() => {
      mockFormUser(tokenValid);
      mockFormSubmission("probably need more vespene gas");
    });

    it("Should return verdicts if file attachments exist and they have been scanned", async () => {
      const filesWithVerdicts = {
        fileName: "file1.pdf",
        avStatus: "clean",
        avTimestamp: "heatDeathOfTheUniverse",
      };
      mockFileAttachments([{ fileName: "file1.pdf" }]);
      mockFileScanVerdict(filesWithVerdicts);
      const { req, res } = createMocks({
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${tokenValid}`,
        },
        query: {
          form: "1",
          submission: "2",
        },
      });
      await verdict(req, res);
      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res._getData())).toMatchObject({
        submissionID: "2",
        fileAttachments: [filesWithVerdicts],
      });
    });

    it("Should return no verdicts if file attachments exist but they haven't been scanned yet", async () => {
      mockFileAttachments([{ fileName: "file1.pdf" }]);
      mockFileScanVerdict(undefined);
      const { req, res } = createMocks({
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${tokenValid}`,
        },
        query: {
          form: "1",
          submission: "3",
        },
      });
      await verdict(req, res);
      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res._getData())).toMatchObject({
        submissionID: "3",
        fileAttachments: [{ fileName: "file1.pdf" }],
      });
    });

    it("Should return an empty array if there are no file attachments", async () => {
      mockFileAttachments([]);
      const { req, res } = createMocks({
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${tokenValid}`,
        },
        query: {
          form: "1",
          submission: "4",
        },
      });
      await verdict(req, res);
      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res._getData())).toMatchObject({ submissionID: "4", fileAttachments: [] });
    });
  });
});

describe("isValidQueryParam", () => {
  it("Should identify valid query param values", () => {
    expect(isValidQueryParam("hello")).toBe(true);
    expect(isValidQueryParam("a slightly longer value")).toBe(true);
  });

  it("Should identify invalid query param values", () => {
    expect(isValidQueryParam("")).toBe(false);
    expect(isValidQueryParam(["42"])).toBe(false);
  });
});
