import { inviteUserByEmail } from "../index";
import { prisma } from "@lib/integration/prismaConnector";
import { UserAbility } from "@lib/types";
import { prismaMock } from "@jestUtils";
import { getUser } from "@lib/users";
import { getTemplateWithAssociatedUsers } from "@lib/templates";
import { sendEmail } from "@lib/integration/notifyConnector";
import { TemplateNotFoundError, UserAlreadyHasAccessError } from "../exceptions";

jest.mock("@lib/integration/prismaConnector");
jest.mock("@lib/privileges");
jest.mock("@lib/integration/notifyConnector");
jest.mock("@lib/logger");
jest.mock("@lib/auditLogs");
jest.mock("@lib/users");
jest.mock("@lib/templates");
jest.mock("@lib/origin");

describe("Invitations", () => {
  const mockAbility: UserAbility = { userID: "1" };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("inviteUserByEmail", () => {
    it("should invite a user by email", async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (getUser as jest.MockedFunction<any>).mockResolvedValue({
        id: "1",
        email: "test@cds-snc.ca",
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (getTemplateWithAssociatedUsers as jest.MockedFunction<any>).mockResolvedValue({
        formRecord: {
          id: "form-id",
          name: "form-name",
        },
        users: [],
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (prismaMock.invitation.create as jest.MockedFunction<any>).mockResolvedValue({
        id: "invitation-id",
      });

      await inviteUserByEmail(mockAbility, "test@example.com", "form-id", "message");

      expect(prisma.invitation.create).toHaveBeenCalled();
      expect(sendEmail).toHaveBeenCalled();
    });

    it("should throw UserAlreadyHasAccessError if user already has access", async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (getUser as jest.MockedFunction<any>).mockResolvedValue({
        id: "1",
        email: "test@cds-snc.ca",
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (getTemplateWithAssociatedUsers as jest.MockedFunction<any>).mockResolvedValue({
        formRecord: {
          id: "form-id",
          name: "form-name",
        },
        users: [
          {
            email: "test@cds-snc.ca",
          },
        ],
      });

      await expect(
        inviteUserByEmail(mockAbility, "test@cds-snc.ca", "form-id", "message")
      ).rejects.toThrow(UserAlreadyHasAccessError);
    });

    it("should throw TemplateNotFoundError if template is not found", async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (getTemplateWithAssociatedUsers as jest.MockedFunction<any>).mockResolvedValue(null);

      await expect(
        inviteUserByEmail(mockAbility, "test@example.com", "form-id", "message")
      ).rejects.toThrow(TemplateNotFoundError);
    });
  });

  //   describe("acceptInvitation", () => {
  //     it("should accept an invitation", async () => {
  //       prisma.invitation.findUnique.mockResolvedValue({
  //         id: "invitation-id",
  //         email: "test@example.com",
  //         expires: new Date(Date.now() + 10000),
  //       });
  //       prisma.user.findFirst.mockResolvedValue({ id: "user-id" });

  //       await acceptInvitation(mockAbility, "invitation-id");

  //       expect(prisma.invitation.delete).toHaveBeenCalled();
  //     });

  //     it("should throw InvitationNotFoundError if invitation is not found", async () => {
  //       prisma.invitation.findUnique.mockResolvedValue(null);

  //       await expect(acceptInvitation(mockAbility, "invitation-id")).rejects.toThrow(
  //         InvitationNotFoundError
  //       );
  //     });

  //     it("should throw InvitationIsExpiredError if invitation is expired", async () => {
  //       prisma.invitation.findUnique.mockResolvedValue({
  //         id: "invitation-id",
  //         email: "test@example.com",
  //         expires: new Date(Date.now() - 10000),
  //       });

  //       await expect(acceptInvitation(mockAbility, "invitation-id")).rejects.toThrow(
  //         InvitationIsExpiredError
  //       );
  //     });
  //   });

  //   describe("cancelInvitation", () => {
  //     it("should cancel an invitation", async () => {
  //       prisma.invitation.findUnique.mockResolvedValue({
  //         id: "invitation-id",
  //         email: "test@example.com",
  //         templateId: "template-id",
  //       });

  //       await cancelInvitation(mockAbility, "invitation-id");

  //       expect(prisma.invitation.delete).toHaveBeenCalled();
  //     });

  //     it("should throw InvitationNotFoundError if invitation is not found", async () => {
  //       prisma.invitation.findUnique.mockResolvedValue(null);

  //       await expect(cancelInvitation(mockAbility, "invitation-id")).rejects.toThrow(
  //         InvitationNotFoundError
  //       );
  //     });
  //   });

  //   describe("declineInvitation", () => {
  //     it("should decline an invitation", async () => {
  //       prisma.invitation.findUnique.mockResolvedValue({
  //         id: "invitation-id",
  //         email: "test@example.com",
  //       });
  //       prisma.user.findFirst.mockResolvedValue({ id: "user-id", email: "test@example.com" });

  //       await declineInvitation(mockAbility, "invitation-id");

  //       expect(prisma.invitation.delete).toHaveBeenCalled();
  //     });

  //     it("should throw InvitationNotFoundError if invitation is not found", async () => {
  //       prisma.invitation.findUnique.mockResolvedValue(null);

  //       await expect(declineInvitation(mockAbility, "invitation-id")).rejects.toThrow(
  //         InvitationNotFoundError
  //       );
  //     });

  //     it("should throw UserNotFoundError if user is not found", async () => {
  //       prisma.invitation.findUnique.mockResolvedValue({
  //         id: "invitation-id",
  //         email: "test@example.com",
  //       });
  //       prisma.user.findFirst.mockResolvedValue(null);

  //       await expect(declineInvitation(mockAbility, "invitation-id")).rejects.toThrow(
  //         UserNotFoundError
  //       );
  //     });
  //   });
});
