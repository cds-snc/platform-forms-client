import { acceptInvitation, inviteUserByEmail } from "../index";
import { prisma } from "@lib/integration/prismaConnector";
import { UserAbility } from "@lib/types";
import { prismaMock } from "@jestUtils";
import { getUser } from "@lib/users";
import { getTemplateWithAssociatedUsers } from "@lib/templates";
import { sendEmail } from "@lib/integration/notifyConnector";
import { TemplateNotFoundError, UserAlreadyHasAccessError } from "../exceptions";
import { inviteToForms } from "../emailTemplates/inviteToForms";
import { inviteToCollaborate } from "../emailTemplates/inviteToCollaborate";
// import { ownerAddedNotification } from "@lib/invitations/emailTemplates/ownerAddedNotification";

jest.mock("@lib/integration/prismaConnector");
jest.mock("@lib/privileges");
jest.mock("@lib/integration/notifyConnector");
jest.mock("@lib/logger");
jest.mock("@lib/auditLogs");
jest.mock("@lib/users");
jest.mock("@lib/templates");
jest.mock("@lib/origin");
jest.mock("@lib/invitations/emailTemplates/inviteToForms");
jest.mock("@lib/invitations/emailTemplates/inviteToCollaborate");
// jest.mock("@lib/invitations/emailTemplates/ownerAddedNotification");

describe("Invitations", () => {
  const mockAbility: UserAbility = { userID: "1" };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("inviteUserByEmail", () => {
    it("should invite a user who doesn't have a Forms account", async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (getUser as jest.MockedFunction<any>).mockResolvedValueOnce({
        id: "1",
        email: "sender@cds-snc.ca",
        name: "sender",
      }); // sender

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (getTemplateWithAssociatedUsers as jest.MockedFunction<any>).mockResolvedValueOnce({
        formRecord: {
          id: "form-id",
          name: "form-name",
        },
        users: [],
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (prismaMock.invitation.create as jest.MockedFunction<any>).mockResolvedValueOnce({
        id: "invitation-id",
        email: "invited@cds-snc.ca",
      });

      // invitee does not have an account
      prisma.user.findFirst.mockResolvedValueOnce(null);

      (inviteToForms as jest.MockedFunction<typeof inviteToForms>).mockReturnValue(
        "email contents"
      );

      await inviteUserByEmail(mockAbility, "invited@cds-snc.ca", "form-id", "message");

      expect(prisma.invitation.create).toHaveBeenCalledTimes(1);

      expect(inviteToForms).toHaveBeenCalledTimes(1);
      expect(inviteToForms).toHaveBeenCalledWith(
        "sender",
        "message",
        expect.stringContaining("register"),
        expect.stringContaining("register")
      );

      expect(sendEmail).toHaveBeenCalledTimes(1);
      expect(sendEmail).toHaveBeenCalledWith(
        "invited@cds-snc.ca",
        expect.objectContaining({
          subject: expect.any(String),
          formResponse: "email contents",
        })
      );
    });

    it("should invite a user who already has an account by email", async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (getUser as jest.MockedFunction<any>).mockResolvedValueOnce({
        id: "1",
        email: "sender@cds-snc.ca",
        name: "sender",
      }); // sender

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (getTemplateWithAssociatedUsers as jest.MockedFunction<any>).mockResolvedValueOnce({
        formRecord: {
          id: "form-id",
          name: "form-name",
        },
        users: [],
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (prismaMock.invitation.create as jest.MockedFunction<any>).mockResolvedValueOnce({
        id: "invitation-id",
        email: "invited@cds-snc.ca",
      });

      // invitee does not have an account
      prisma.user.findFirst.mockResolvedValueOnce({
        id: "2",
        email: "invited@cds-snc.ca",
        name: "invited",
      });

      (inviteToCollaborate as jest.MockedFunction<typeof inviteToCollaborate>).mockReturnValue(
        "email contents"
      );

      await inviteUserByEmail(mockAbility, "invited@cds-snc.ca", "form-id", "message");

      expect(prisma.invitation.create).toHaveBeenCalledTimes(1);
      expect(inviteToCollaborate).toHaveBeenCalledTimes(1);
      expect(inviteToCollaborate).toHaveBeenCalledWith(
        "sender",
        "message",
        "form-name",
        expect.stringContaining("forms"),
        expect.stringContaining("forms")
      );
      expect(sendEmail).toHaveBeenCalledTimes(1);
      expect(sendEmail).toHaveBeenCalledWith("invited@cds-snc.ca", expect.any(Object));
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

  describe("acceptInvitation", () => {
    // it("should accept an invitation", async () => {
    //   prisma.invitation.findUnique.mockResolvedValue({
    //     id: "invitation-id",
    //     email: "test@example.com",
    //     name: "Test user",
    //     expires: new Date(Date.now() + 10000),
    //   });
    //   prisma.user.findFirst.mockResolvedValue({
    //     id: "user-id",
    //     name: "test user",
    //     email: "test@cds-snc.ca",
    //   });
    //   prisma.template.findFirst.mockResolvedValue({
    //     id: "template-id",
    //     users: [{ id: "user-id", email: "test@cds-snc.ca", name: "test user" }],
    //   });
    //   await acceptInvitation(mockAbility, "invitation-id");
    //   expect(prisma.template.update).toHaveBeenCalled();
    //   expect(prisma.invitation.delete).toHaveBeenCalled();
    //   // expect(ownerAddedNotification).toHaveBeenCalled();
    //   expect(sendEmail).toHaveBeenCalled();
    // });
    // it("should throw InvitationNotFoundError if invitation is not found", async () => {
    //   prisma.invitation.findUnique.mockResolvedValue(null);
    //   await expect(acceptInvitation(mockAbility, "invitation-id")).rejects.toThrow(
    //     InvitationNotFoundError
    //   );
    // });
    // it("should throw InvitationIsExpiredError if invitation is expired", async () => {
    //   prisma.invitation.findUnique.mockResolvedValue({
    //     id: "invitation-id",
    //     email: "test@example.com",
    //     expires: new Date(Date.now() - 10000),
    //   });
    //   await expect(acceptInvitation(mockAbility, "invitation-id")).rejects.toThrow(
    //     InvitationIsExpiredError
    //   );
    // });
  });

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
