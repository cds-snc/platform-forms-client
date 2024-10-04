import { acceptInvitation, inviteUserByEmail } from "../index";
import { prisma } from "@lib/integration/prismaConnector";
import { UserAbility } from "@lib/types";
import { prismaMock } from "@jestUtils";
import { getUser } from "@lib/users";
import { getTemplateWithAssociatedUsers } from "@lib/templates";
import { sendEmail } from "@lib/integration/notifyConnector";
import {
  InvitationIsExpiredError,
  InvitationNotFoundError,
  TemplateNotFoundError,
  UserAlreadyHasAccessError,
} from "../exceptions";
import { inviteToForms } from "../emailTemplates/inviteToForms";
import { inviteToCollaborate } from "../emailTemplates/inviteToCollaborate";
import { mockAppUser } from "./fixtures/AppUser";
import { mockTemplateWithUsers } from "./fixtures/TemplateWithUsers";
import { mockInvitation } from "./fixtures/Invitation";
import { mockUser } from "./fixtures/User";
import { mockTemplate } from "./fixtures/Template";
import { ownerAddedNotification } from "../emailTemplates/ownerAddedNotification";

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
jest.mock("@lib/invitations/emailTemplates/ownerAddedNotification");

describe("Invitations", () => {
  const mockAbility: UserAbility = { userID: "1" };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("inviteUserByEmail", () => {
    it("should throw UserAlreadyHasAccessError if user already has access", async () => {
      (getUser as jest.MockedFunction<typeof getUser>).mockResolvedValue(mockAppUser());

      (
        getTemplateWithAssociatedUsers as jest.MockedFunction<typeof getTemplateWithAssociatedUsers>
      ).mockResolvedValue(mockTemplateWithUsers());

      await expect(
        inviteUserByEmail(mockAbility, "test@cds-snc.ca", "form-id", "message")
      ).rejects.toThrow(UserAlreadyHasAccessError);
    });

    it("should throw TemplateNotFoundError if template is not found", async () => {
      (
        getTemplateWithAssociatedUsers as jest.MockedFunction<typeof getTemplateWithAssociatedUsers>
      ).mockResolvedValue(null);

      await expect(
        inviteUserByEmail(mockAbility, "test@example.com", "form-id", "message")
      ).rejects.toThrow(TemplateNotFoundError);
    });

    it("should invite a user who doesn't have a Forms account", async () => {
      (getUser as jest.MockedFunction<typeof getUser>).mockResolvedValueOnce(
        mockAppUser({
          email: "sender@cds-snc.ca",
          name: "sender",
        })
      ); // sender

      (
        getTemplateWithAssociatedUsers as jest.MockedFunction<typeof getTemplateWithAssociatedUsers>
      ).mockResolvedValueOnce(mockTemplateWithUsers());

      (prismaMock.invitation.create as jest.Mock).mockResolvedValueOnce(
        mockInvitation({
          email: "invited@cds-snc.ca",
        })
      );

      // invitee does not have an account
      (prisma.user.findFirst as jest.Mock).mockResolvedValueOnce(null);

      (inviteToForms as jest.Mock).mockReturnValue("email contents");

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

    it("should invite a user who already has an account", async () => {
      (getUser as jest.MockedFunction<typeof getUser>).mockResolvedValueOnce(
        mockAppUser({
          email: "sender@cds-snc.ca",
          name: "sender",
        })
      ); // sender

      (
        getTemplateWithAssociatedUsers as jest.MockedFunction<typeof getTemplateWithAssociatedUsers>
      ).mockResolvedValueOnce(mockTemplateWithUsers());

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (prismaMock.invitation.create as jest.MockedFunction<any>).mockResolvedValueOnce(
        mockInvitation({
          email: "invited@cds-snc.ca",
        })
      );

      // invitee does not have an account
      prismaMock.user.findFirst.mockResolvedValueOnce(mockUser());

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

    it("should reinvite a user whose invitation has expired", async () => {
      (getUser as jest.MockedFunction<typeof getUser>).mockResolvedValueOnce({
        id: "1",
        email: "sender@cds-snc.ca",
        name: "sender",
        privileges: [],
        active: true,
      }); // sender

      (
        getTemplateWithAssociatedUsers as jest.MockedFunction<typeof getTemplateWithAssociatedUsers>
      ).mockResolvedValueOnce({
        formRecord: {
          id: "form-id",
          name: "form-name",
          isPublished: false,
          securityAttribute: "Unclassified",
          form: {
            titleEn: "form-name",
            titleFr: "form-name",
            id: "form-id",
            layout: [],
            elements: [],
          },
        },
        users: [],
      });

      const expires = new Date();
      expires.setDate(expires.getDate() - 7);
      prismaMock.invitation.findFirst.mockResolvedValueOnce(mockInvitation({ expires })); // expired invitation

      prismaMock.invitation.create.mockResolvedValueOnce(
        mockInvitation({
          id: "new-invitation-id",
          email: "invited2@cds-snc.ca",
        })
      );

      // invitee does not have an account
      prismaMock.user.findFirst.mockResolvedValueOnce(null);

      (inviteToForms as jest.MockedFunction<typeof inviteToForms>).mockReturnValue(
        "email contents"
      );

      await inviteUserByEmail(mockAbility, "invited2@cds-snc.ca", "form-id", "message");

      expect(prisma.invitation.delete).toHaveBeenCalledTimes(1); // delete expired
      expect(prisma.invitation.delete).toHaveBeenCalledWith({ where: { id: "invitation-id" } });

      expect(prisma.invitation.create).toHaveBeenCalledTimes(1); // create new
      expect(inviteToForms).toHaveBeenCalledTimes(1);
      expect(inviteToForms).toHaveBeenCalledWith(
        "sender",
        "message",
        expect.stringContaining("register"),
        expect.stringContaining("register")
      );
      expect(sendEmail).toHaveBeenCalledTimes(1);
      expect(sendEmail).toHaveBeenCalledWith("invited2@cds-snc.ca", expect.any(Object));
    });
  });

  describe("acceptInvitation", () => {
    it("should throw InvitationNotFoundError if invitation is not found", async () => {
      prismaMock.invitation.findUnique.mockResolvedValue(null);
      await expect(acceptInvitation(mockAbility, "invitation-id")).rejects.toThrow(
        InvitationNotFoundError
      );
    });

    it("should throw InvitationIsExpiredError if invitation is expired", async () => {
      prismaMock.invitation.findUnique.mockResolvedValue(
        mockInvitation({
          id: "invitation-id",
          email: "test@example.com",
          expires: new Date(Date.now() - 10000),
        })
      );
      await expect(acceptInvitation(mockAbility, "invitation-id")).rejects.toThrow(
        InvitationIsExpiredError
      );
    });

    it("should accept an invitation", async () => {
      prismaMock.invitation.findUnique.mockResolvedValueOnce(
        mockInvitation({
          id: "invitation-id",
          email: "invited@cds-snc.ca",
          expires: new Date(Date.now() + 10000),
        })
      ); // invitation not expired

      prismaMock.user.findFirst.mockResolvedValueOnce(
        mockUser({
          id: "invited-user-id",
          name: "test user",
          email: "invited@cds-snc.ca",
        })
      ); // user exists

      prismaMock.template.findFirst.mockResolvedValueOnce(
        mockTemplate({
          id: "template-id",
          name: "template-name",
          users: [
            { id: "user-id-1", email: "owner1@cds-snc.ca", name: "owner 1" },
            { id: "user-id-2", email: "owner2@cds-snc.ca", name: "owner 2" },
          ],
        })
      );

      (
        ownerAddedNotification as jest.MockedFunction<typeof ownerAddedNotification>
      ).mockReturnValue("email contents");

      await acceptInvitation(mockAbility, "invitation-id");

      // Retrieve the template with owners
      expect(prisma.template.update).toHaveBeenCalledWith({
        where: { id: "template-id" },
        data: {
          users: {
            connect: { id: "invited-user-id" },
          },
        },
      });

      // Delete the invitation
      expect(prisma.invitation.delete).toHaveBeenCalledWith({
        where: { id: "invitation-id" },
      });

      // Notify existing owners
      expect(ownerAddedNotification).toHaveBeenCalled();
      expect(sendEmail).toHaveBeenCalledTimes(2);
      expect(sendEmail).toHaveBeenCalledWith("owner1@cds-snc.ca", expect.any(Object));
      expect(sendEmail).toHaveBeenCalledWith("owner2@cds-snc.ca", expect.any(Object));
    });
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
