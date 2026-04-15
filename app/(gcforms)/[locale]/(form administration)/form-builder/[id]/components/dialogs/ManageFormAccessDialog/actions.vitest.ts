import { beforeEach, describe, expect, it, Mock, vi } from "vitest";

vi.mock("@lib/auth", () => ({
  auth: vi.fn().mockResolvedValue({ user: { id: "test-user-id" } }),
}));

vi.mock("@lib/cache/flags", () => ({
  checkOne: vi.fn(),
}));

vi.mock("@lib/templates", () => ({
  getPublicTemplateByID: vi.fn(),
  getTemplateWithAssociatedUsers: vi.fn(),
  removeAssignedUserFromTemplate: vi.fn(),
}));

vi.mock("@lib/invitations/inviteUserByEmail", () => ({
  inviteUserByEmail: vi.fn(),
}));

vi.mock("@i18n", () => ({
  serverTranslation: vi.fn(),
}));

vi.mock("@lib/logger", () => ({
  logMessage: {
    error: vi.fn(),
  },
}));

import { checkOne } from "@lib/cache/flags";
import { serverTranslation } from "@i18n";
import { inviteUserByEmail } from "@lib/invitations/inviteUserByEmail";
import { getPublicTemplateByID } from "@lib/templates";
import { sendInvitation } from "./actions";

describe("sendInvitation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (serverTranslation as Mock).mockResolvedValue({
      t: (key: string) => key,
    });
    (inviteUserByEmail as Mock).mockResolvedValue(undefined);
  });

  it("returns a draft form error when locked editing is disabled", async () => {
    (checkOne as Mock).mockResolvedValue(false);
    (getPublicTemplateByID as Mock).mockResolvedValue({ isPublished: false });

    const result = await sendInvitation(["invitee@cds-snc.ca"], "form-id", "message");

    expect(getPublicTemplateByID).toHaveBeenCalledWith("form-id");
    expect(inviteUserByEmail).not.toHaveBeenCalled();
    expect(result).toEqual({
      success: false,
      errors: ["draftFormError"],
    });
  });

  it("skips the publish check when locked editing is enabled", async () => {
    (checkOne as Mock).mockResolvedValue(true);

    const result = await sendInvitation(["invitee@cds-snc.ca"], "form-id", "message");

    expect(getPublicTemplateByID).not.toHaveBeenCalled();
    expect(inviteUserByEmail).toHaveBeenCalledWith("invitee@cds-snc.ca", "form-id", "message");
    expect(result).toEqual({
      success: true,
    });
  });

  it("continues inviting when locked editing is disabled and the form is published", async () => {
    (checkOne as Mock).mockResolvedValue(false);
    (getPublicTemplateByID as Mock).mockResolvedValue({ isPublished: true });

    const result = await sendInvitation(["invitee@cds-snc.ca"], "form-id", "message");

    expect(getPublicTemplateByID).toHaveBeenCalledWith("form-id");
    expect(inviteUserByEmail).toHaveBeenCalledWith("invitee@cds-snc.ca", "form-id", "message");
    expect(result).toEqual({
      success: true,
    });
  });
});
