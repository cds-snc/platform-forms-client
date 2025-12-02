/* eslint-disable @typescript-eslint/no-explicit-any */

import { checkMachineUserExists, checkKeyExists, createKey, deleteKey } from "@lib/serviceAccount";
import { mockAuthorizationPass, mockAuthorizationFail } from "__utils__/authorization";
import { AccessControlError } from "@lib/auth/errors";
import { prismaMock } from "@jestUtils";
import { logEvent } from "@lib/auditLogs";
import * as ZitadelConnector from "@lib/integration/zitadelConnector";

jest.mock("@lib/auditLogs", () => ({
  __esModule: true,
  logEvent: jest.fn(),
  get AuditLogDetails() {
    return jest.requireActual("@lib/auditLogs").AuditLogDetails;
  },
  get AuditLogAccessDeniedDetails() {
    return jest.requireActual("@lib/auditLogs").AuditLogAccessDeniedDetails;
  }
}));

jest.mock("@lib/templates");
jest.mock("@lib/privileges");
const mockedLogEvent = jest.mocked(logEvent, { shallow: true });

jest.mock("@lib/integration/zitadelConnector", () => ({
  createMachineUser: jest.fn(),
  getMachineUser: jest.fn(),
  deleteMachineUser: jest.fn(),
  createMachineKey: jest.fn(),
  getMachineUserKeyById: jest.fn(),
}));

const userId = "1";

describe("Service Account functions", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockAuthorizationPass(userId);
  });

  describe("checkMachineUserExists", () => {
    it("should return user ID if user exists", async () => {
      const userId = "testUser";

      (ZitadelConnector.getMachineUser as jest.Mock).mockResolvedValueOnce({ userId });

      const result = await checkMachineUserExists(userId);

      expect(result).toBe(userId);
    });
    it("should return undefined if user does not exist", async () => {
      const userId = "testUser";

      (ZitadelConnector.getMachineUser as jest.Mock).mockResolvedValueOnce(undefined);

      const result = await checkMachineUserExists(userId);

      expect(result).toBe(undefined);
    });
    it("should throw and error is user is not authentiated to perform the action", async () => {
      mockAuthorizationFail(userId);
      await expect(checkMachineUserExists("blah")).rejects.toThrow(AccessControlError);
    });
    it("should throw and error is user is not authorized to perform the action", async () => {
      mockAuthorizationFail(userId);
      await expect(checkMachineUserExists("blah")).rejects.toThrow(AccessControlError);
    });
  });
  describe("checkKeyExists", () => {
    it("should return true if key exists", async () => {
      const userId = "testUser";
      const keyId = "test";

      (prismaMock.apiServiceAccount.findUnique as jest.MockedFunction<any>).mockResolvedValueOnce({
        id: userId,
        publicKeyId: keyId,
      });

      (ZitadelConnector.getMachineUserKeyById as jest.Mock).mockResolvedValueOnce({ keyId });

      const result = await checkKeyExists(userId);
      expect(result).toBe(keyId);
    });
    it("should return false if key does not exist", async () => {
      const keyId = "test";

      (prismaMock.apiServiceAccount.findUnique as jest.MockedFunction<any>).mockResolvedValueOnce(
        null
      );

      (ZitadelConnector.getMachineUserKeyById as jest.Mock).mockResolvedValueOnce({ keyId });

      const result = await checkKeyExists("testUser");
      expect(result).toBe(false);
    });
    it("should return false if key is out of sync", async () => {
      const userId = "testUser";
      const keyId = "test";

      (prismaMock.apiServiceAccount.findUnique as jest.MockedFunction<any>).mockResolvedValueOnce({
        id: userId,
        publicKeyId: keyId,
      });

      (ZitadelConnector.getMachineUserKeyById as jest.Mock).mockResolvedValueOnce({
        keyId: "differentKey",
      });

      const result = await checkKeyExists(userId);

      expect(result).toBe(false);
    });
    it("should throw and error is user is not authentiated to perform the action", async () => {
      mockAuthorizationFail(userId);
      await expect(checkKeyExists("blah")).rejects.toThrow(AccessControlError);
    });
    it("should throw and error is user is not authorized to perform the action", async () => {
      mockAuthorizationFail(userId);
      await expect(checkKeyExists("blah")).rejects.toThrow(AccessControlError);
    });
  });
  describe("createKey", () => {
    it("should create a key if no current user exists", async () => {
      (ZitadelConnector.getMachineUser as jest.Mock).mockResolvedValueOnce(undefined);
      (ZitadelConnector.createMachineUser as jest.Mock).mockResolvedValueOnce({
        userId: "serviceAccountUser",
      });
      (ZitadelConnector.createMachineKey as jest.Mock).mockResolvedValueOnce({ keyId: "keyId" });

      const result = await createKey("templateId");
      expect(result).toMatchObject({
        type: "serviceAccount",
        userId: "serviceAccountUser",
        keyId: "keyId",
        formId: "templateId",
      });
      expect(mockedLogEvent).toHaveBeenCalledWith(
        "1",
        { type: "ServiceAccount" },
        "CreateAPIKey",
        "User :${userId} created API key for service account ${serviceAccountId}",
        { "serviceAccountId": "serviceAccountUser", "userId": "1" }
      );
    });
    it("should create a key if an existing user exists", async () => {
      (ZitadelConnector.getMachineUser as jest.Mock).mockResolvedValueOnce({
        userId: "templateId",
      });
      (ZitadelConnector.createMachineKey as jest.Mock).mockResolvedValueOnce({ keyId: "keyId" });

      const result = await createKey("templateId");
      expect(result).toMatchObject({
        type: "serviceAccount",
        userId: "templateId",
        keyId: "keyId",
        formId: "templateId",
      });
      expect(mockedLogEvent).toHaveBeenCalledWith(
        "1",
        { type: "ServiceAccount" },
        "CreateAPIKey",
        "User :${userId} created API key for service account ${serviceAccountId}",
        { "serviceAccountId": "templateId", "userId": "1" }
      );
    });
    it("should throw and error is user is not authentiated to perform the action", async () => {
      mockAuthorizationFail(userId);
      await expect(createKey("templateId")).rejects.toThrow(AccessControlError);
    });
    it("should throw and error is user is not authorized to perform the action", async () => {
      mockAuthorizationFail(userId);
      await expect(createKey("templateId")).rejects.toThrow(AccessControlError);
    });
  });

  describe("deleteKey", () => {
    it("should delete a key if there is an existing user in the IDP", async () => {
      const serviceAccountID = "123412341234";

      (ZitadelConnector.getMachineUser as jest.Mock).mockResolvedValueOnce({
        userId: serviceAccountID,
      });
      (ZitadelConnector.deleteMachineUser as jest.Mock).mockResolvedValueOnce({});

      (prismaMock.apiServiceAccount.deleteMany as jest.MockedFunction<any>).mockResolvedValue({
        count: 1,
      });
      await deleteKey("templateId");

      expect(mockedLogEvent).toHaveBeenCalledWith(
        "1",
        { type: "ServiceAccount" },
        "DeleteAPIKey",
        "DeletedAPIKey",
        {"serviceAccountID": serviceAccountID, "templateId": "templateId", "userId": "1"}
      );
    });
    it("should delete a key if there is not an existing user in the IDP", async () => {
      (ZitadelConnector.getMachineUser as jest.Mock).mockResolvedValueOnce(undefined);
      (ZitadelConnector.deleteMachineUser as jest.Mock).mockResolvedValueOnce({});

      (prismaMock.apiServiceAccount.deleteMany as jest.MockedFunction<any>).mockResolvedValue({
        count: 1,
      });
      await deleteKey("templateId");

      expect(mockedLogEvent).toHaveBeenCalledWith(
        "1",
        { type: "ServiceAccount" },
        "DeleteAPIKey",
        "DeletedAPIKey",
        {"templateId": "templateId", "userId": "1", "serviceAccountID": ""}
      );
    });
    it("should not throw an Error if the key does not exist in the database", async () => {
      const serviceAccountID = "123412341234";

      (ZitadelConnector.getMachineUser as jest.Mock).mockResolvedValueOnce({
        userId: serviceAccountID,
      });
      (ZitadelConnector.deleteMachineUser as jest.Mock).mockResolvedValueOnce({});

      (prismaMock.apiServiceAccount.deleteMany as jest.MockedFunction<any>).mockResolvedValue({
        count: 0,
      });
      await deleteKey("templateId");

      expect(mockedLogEvent).toHaveBeenCalledWith(
        "1",
        { type: "ServiceAccount" },
        "DeleteAPIKey",
        "DeletedAPIKey",
        {"serviceAccountID": serviceAccountID, "templateId": "templateId", "userId": "1"}
      );
    });

    it("should throw and error is user is not authentiated to perform the action", async () => {
      mockAuthorizationFail(userId);
      await expect(deleteKey("templateId")).rejects.toThrow(AccessControlError);
    });
    it("should throw and error is user is not authorized to perform the action", async () => {
      mockAuthorizationFail(userId);
      await expect(deleteKey("templateId")).rejects.toThrow(AccessControlError);
    });
  });
});
