import { prisma } from "@lib/integration/prismaConnector";
import { prismaMock } from "@jestUtils";
import { mockAuthorizationPass, mockGetAbility } from "__utils__/authorization";
import { getUser } from "@lib/users";
import { getTemplateWithAssociatedUsers } from "@lib/templates";
import { sendEmail } from "@lib/integration/notifyConnector";
import {
  InvalidDomainError,
  InvitationIsExpiredError,
  InvitationNotFoundError,
  MismatchedEmailDomainError,
  TemplateNotFoundError,
  UserAlreadyHasAccessError,
  UserNotFoundError,
} from "../exceptions";
import { inviteToFormsEmailTemplate } from "../emailTemplates/inviteToFormsEmailTemplate";
import { inviteToCollaborateEmailTemplate } from "../emailTemplates/inviteToCollaborateEmailTemplate";
import { mockAppUser } from "./fixtures/AppUser";
import { mockTemplateWithUsers } from "./fixtures/TemplateWithUsers";
import { mockInvitation } from "./fixtures/Invitation";
import { mockUser } from "./fixtures/User";
import { ownerAddedEmailTemplate } from "../emailTemplates/ownerAddedEmailTemplate";
import { inviteUserByEmail } from "../inviteUserByEmail";
import { acceptInvitation } from "../acceptInvitation";
import { cancelInvitation } from "../cancelInvitation";
import { declineInvitation } from "../declineInvitation";
import { logEvent } from "@lib/auditLogs";
import { mockTemplate } from "./fixtures/Template";
jest.mock("@lib/privileges");
jest.mock("@lib/integration/prismaConnector");
jest.mock("@lib/integration/notifyConnector");
jest.mock("@lib/logger");
jest.mock("@lib/auditLogs");
jest.mock("@lib/users");
jest.mock("@lib/templates");
jest.mock("@lib/invitations/emailTemplates/inviteToFormsEmailTemplate");
jest.mock("@lib/invitations/emailTemplates/inviteToCollaborateEmailTemplate");
jest.mock("@lib/invitations/emailTemplates/ownerAddedEmailTemplate");

const userId = "test-user-id";
jest.mock("@lib/origin", () => ({
  getOrigin: jest.fn().mockReturnValue("http://localhost:3000"),
}));

describe("Invitations", () => {
  beforeEach(() => {
    mockAuthorizationPass(userId);
    jest.clearAllMocks();
  });

  describe("inviteUserByEmail", () => {
    it("should throw UserAlreadyHasAccessError if user already has access", async () => {
      (getUser as jest.MockedFunction<typeof getUser>).mockResolvedValue(mockAppUser());

      (
        getTemplateWithAssociatedUsers as jest.MockedFunction<typeof getTemplateWithAssociatedUsers>
      ).mockResolvedValue(mockTemplateWithUsers());

      await expect(inviteUserByEmail("test@cds-snc.ca", "form-id", "message")).rejects.toThrow(
        UserAlreadyHasAccessError
      );
    });

    it("should throw MismatchedEmailDomainError if email domain does not match sender's domain", async () => {
      (getUser as jest.MockedFunction<typeof getUser>).mockResolvedValue(
        mockAppUser({
          email: "test@cds-snc.ca",
        })
      );

      (
        getTemplateWithAssociatedUsers as jest.MockedFunction<typeof getTemplateWithAssociatedUsers>
      ).mockResolvedValue(mockTemplateWithUsers());

      await expect(
        inviteUserByEmail("test@servicecanada.gc.ca", "form-id", "message")
      ).rejects.toThrow(MismatchedEmailDomainError);
    });

    it("should throw invalidDomainError if email is not a valid government email", async () => {
      (getUser as jest.MockedFunction<typeof getUser>).mockResolvedValue(mockAppUser());

      (
        getTemplateWithAssociatedUsers as jest.MockedFunction<typeof getTemplateWithAssociatedUsers>
      ).mockResolvedValue(mockTemplateWithUsers());

      await expect(inviteUserByEmail("test@notagovdomain", "form-id", "message")).rejects.toThrow(
        InvalidDomainError
      );
    });

    it("should throw TemplateNotFoundError if template is not found", async () => {
      (
        getTemplateWithAssociatedUsers as jest.MockedFunction<typeof getTemplateWithAssociatedUsers>
      ).mockResolvedValue(null);

      await expect(inviteUserByEmail("test@example.com", "form-id", "message")).rejects.toThrow(
        TemplateNotFoundError
      );
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

      (inviteToFormsEmailTemplate as jest.Mock).mockReturnValue("email contents");

      await inviteUserByEmail("invited@cds-snc.ca", "form-id", "message");

      expect(prisma.invitation.create).toHaveBeenCalledTimes(1);

      expect(inviteToFormsEmailTemplate).toHaveBeenCalledTimes(1);
      expect(inviteToFormsEmailTemplate).toHaveBeenCalledWith(
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

      (
        inviteToCollaborateEmailTemplate as jest.MockedFunction<
          typeof inviteToCollaborateEmailTemplate
        >
      ).mockReturnValue("email contents");

      await inviteUserByEmail("invited@cds-snc.ca", "form-id", "message");

      expect(prisma.invitation.create).toHaveBeenCalledTimes(1);
      expect(inviteToCollaborateEmailTemplate).toHaveBeenCalledTimes(1);
      expect(inviteToCollaborateEmailTemplate).toHaveBeenCalledWith(
        "sender",
        "message",
        "form-name",
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

      (
        inviteToFormsEmailTemplate as jest.MockedFunction<typeof inviteToFormsEmailTemplate>
      ).mockReturnValue("email contents");

      await inviteUserByEmail("invited2@cds-snc.ca", "form-id", "message");

      expect(prisma.invitation.delete).toHaveBeenCalledTimes(1); // delete expired
      expect(prisma.invitation.delete).toHaveBeenCalledWith({ where: { id: "invitation-id" } });

      expect(prisma.invitation.create).toHaveBeenCalledTimes(1); // create new
      expect(inviteToFormsEmailTemplate).toHaveBeenCalledTimes(1);
      expect(inviteToFormsEmailTemplate).toHaveBeenCalledWith(
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
      await expect(acceptInvitation("invitation-id")).rejects.toThrow(InvitationNotFoundError);
    });

    it("should throw InvitationIsExpiredError if invitation is expired", async () => {
      prismaMock.invitation.findUnique.mockResolvedValue(
        mockInvitation({
          id: "invitation-id",
          email: "test@example.com",
          expires: new Date(Date.now() - 10000),
        })
      );
      await expect(acceptInvitation("invitation-id")).rejects.toThrow(InvitationIsExpiredError);
    });

    it("should accept an invitation", async () => {
      mockGetAbility("invited-user-id");

      prismaMock.invitation.findUnique.mockResolvedValueOnce(
        mockInvitation({
          id: "invitation-id",
          email: "invited@cds-snc.ca",
          expires: new Date(Date.now() + 10000),
          templateId: "template-id",
        })
      ); // invitation not expired

      prismaMock.user.findFirst.mockResolvedValueOnce(
        mockUser({
          id: "invited-user-id",
          name: "test user",
          email: "invited@cds-snc.ca",
        })
      ); // user exists

      prismaMock.template.update.mockResolvedValueOnce(
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
        ownerAddedEmailTemplate as jest.MockedFunction<typeof ownerAddedEmailTemplate>
      ).mockReturnValue("email contents");

      await acceptInvitation("invitation-id");

      // Delete the invitation
      expect(prisma.invitation.delete).toHaveBeenCalledWith({
        where: { id: "invitation-id" },
      });

      // Log event
      expect(logEvent).toHaveBeenCalledWith(
        "invited-user-id",
        { id: "template-id", type: "Form" },
        "InvitationAccepted",
        "invited-user-id has accepted an invitation"
      );

      // @TODO: these tests need to move to templates.test.ts
      // Retrieve the template with owners
      // expect(prisma.template.update).toHaveBeenCalledWith({
      //   where: { id: "template-id" },
      //   data: {
      //     users: {
      //       connect: { id: "invited-user-id" },
      //     },
      //   },
      // });
      // Notify existing owners
      // expect(ownerAddedNotification).toHaveBeenCalled();
      // expect(sendEmail).toHaveBeenCalledTimes(2);
      // expect(sendEmail).toHaveBeenCalledWith("owner1@cds-snc.ca", expect.any(Object));
      // expect(sendEmail).toHaveBeenCalledWith("owner2@cds-snc.ca", expect.any(Object));
    });
  });

  describe("cancelInvitation", () => {
    it("should cancel an invitation", async () => {
      mockAuthorizationPass("user-id");

      prismaMock.invitation.findUnique.mockResolvedValue(
        mockInvitation({
          id: "invitation-id",
          email: "test@example.com",
          templateId: "template-id",
        })
      );

      (
        getTemplateWithAssociatedUsers as jest.MockedFunction<typeof getTemplateWithAssociatedUsers>
      ).mockResolvedValue(
        mockTemplateWithUsers({
          users: [
            {
              id: "user-id",
              name: "test",
              email: "test@cds-snc.ca",
            },
          ],
        })
      );

      await cancelInvitation("invitation-id");

      expect(prismaMock.invitation.delete).toHaveBeenCalledWith({
        where: { id: "invitation-id" },
      });
    });

    it("should throw InvitationNotFoundError if invitation is not found", async () => {
      prismaMock.invitation.findUnique.mockResolvedValue(null);

      await expect(cancelInvitation("invitation-id")).rejects.toThrow(InvitationNotFoundError);
    });
  });

  describe("declineInvitation", () => {
    it("should decline an invitation", async () => {
      mockGetAbility("test-user-id");
      prismaMock.invitation.findUnique.mockResolvedValue(
        mockInvitation({
          id: "invitation-id",
          email: "test@cds-snc.ca",
        })
      );
      (getUser as jest.MockedFunction<typeof getUser>).mockResolvedValue(mockAppUser());

      await declineInvitation("invitation-id");

      expect(prismaMock.invitation.delete).toHaveBeenCalled();
    });

    it("should throw InvitationNotFoundError if invitation is not found", async () => {
      prismaMock.invitation.findUnique.mockResolvedValueOnce(null);

      await expect(declineInvitation("invitation-id")).rejects.toThrow(InvitationNotFoundError);
    });

    it("should throw UserNotFoundError if user is not found", async () => {
      prismaMock.invitation.findUnique.mockResolvedValueOnce(
        mockInvitation({
          id: "invitation-id",
          email: "test@example.com",
        })
      );

      (getUser as jest.Mock).mockRejectedValueOnce(new UserNotFoundError());

      await expect(declineInvitation("invitation-id")).rejects.toThrow(UserNotFoundError);
    });
  });
});
