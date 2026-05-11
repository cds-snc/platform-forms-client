import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@gcforms/database", () => ({
  prisma: {
    invitation: {
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
    user: {
      findFirst: vi.fn(),
    },
    template: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("@lib/privileges", () => ({
  getAbility: vi.fn(),
}));

vi.mock("@lib/auditLogs", () => ({
  AuditLogDetails: {
    AcceptedInvitation: "AcceptedInvitation",
  },
  AuditLogEvent: {
    InvitationAccepted: "InvitationAccepted",
  },
  logEvent: vi.fn(),
}));

vi.mock("@lib/templates", () => ({
  notifyOwnersOwnerAdded: vi.fn(),
}));

vi.mock("@lib/logger", () => ({
  logMessage: {
    error: vi.fn(),
  },
}));

vi.mock("@lib/editLocks", () => ({
  invalidateTemplateEditLockUserCountCache: vi.fn(),
}));

import { prisma } from "@gcforms/database";
import { invalidateTemplateEditLockUserCountCache } from "@lib/editLocks";
import { acceptInvitation } from "@lib/invitations/acceptInvitation";
import { mockGetAbility } from "__utils__/authorization";

describe("acceptInvitation", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(prisma.invitation.findUnique).mockResolvedValue({
      id: "invitation-1",
      templateId: "form-1",
      email: "owner.two@example.com",
      expires: new Date("2099-01-01T00:00:00.000Z"),
      invitedBy: "user-1",
    });

    vi.mocked(prisma.user.findFirst).mockResolvedValue({
      id: "user-2",
      name: "Owner Two",
      email: "owner.two@example.com",
      image: null,
      emailVerified: null,
      lastLogin: new Date(),
      active: true,
      notes: null,
      createdAt: new Date(),
    });

    vi.mocked(prisma.template.findUnique).mockResolvedValue({
      id: "form-1",
      created_at: new Date(),
      updated_at: new Date(),
      name: "Test Form",
      jsonConfig: {},
      isPublished: false,
      securityAttribute: "Unclassified",
      formPurpose: "test",
      publishReason: "",
      publishFormType: "",
      publishDesc: "",
      saveAndResume: false,
      notificationsInterval: null,
      bearerToken: null,
      ttl: null,
      closingDate: null,
      closedDetails: null,
    });

    vi.mocked(prisma.template.update).mockResolvedValue({
      id: "form-1",
      created_at: new Date(),
      updated_at: new Date(),
      name: "Test Form",
      jsonConfig: {},
      isPublished: false,
      securityAttribute: "Unclassified",
      formPurpose: "test",
      publishReason: "",
      publishFormType: "",
      publishDesc: "",
      saveAndResume: false,
      notificationsInterval: null,
      bearerToken: null,
      ttl: null,
      closingDate: null,
      closedDetails: null,
    });

    vi.mocked(prisma.invitation.delete).mockResolvedValue({
      id: "invitation-1",
      templateId: "form-1",
      email: "owner.two@example.com",
      expires: new Date("2099-01-01T00:00:00.000Z"),
      invitedBy: "user-1",
    });

    mockGetAbility("user-2", "owner.two@example.com");
  });

  it("invalidates the edit-lock user count cache after assigning the invited user", async () => {
    await acceptInvitation("invitation-1");

    expect(invalidateTemplateEditLockUserCountCache).toHaveBeenCalledWith("form-1");
  });
});
