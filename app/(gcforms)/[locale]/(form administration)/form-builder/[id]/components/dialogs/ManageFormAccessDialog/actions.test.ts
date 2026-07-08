import { beforeEach, describe, expect, it, Mock, vi } from "vitest";

vi.mock("@lib/auth", () => ({
  auth: vi.fn().mockResolvedValue({ user: { id: "test-user-id" } }),
}));

vi.mock("@lib/templates/queries/getTemplateWithAssignedUsers", () => ({
  getTemplateWithAssignedUsers: vi.fn(),
}));

vi.mock("@lib/templates/mutations/removeAssignedUserFromTemplate", () => ({
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

import { serverTranslation } from "@i18n/server";
import { inviteUserByEmail } from "@lib/invitations/inviteUserByEmail";
import { sendInvitation } from "./actions";

describe("sendInvitation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (serverTranslation as Mock).mockResolvedValue({
      t: (key: string) => key,
    });
    (inviteUserByEmail as Mock).mockResolvedValue(undefined);
  });

  it("sends invitations without a publish-status pre-check", async () => {
    const result = await sendInvitation(["invitee@cds-snc.ca"], "form-id", "message");

    expect(inviteUserByEmail).toHaveBeenCalledWith("invitee@cds-snc.ca", "form-id", "message");
    expect(result).toEqual({
      success: true,
    });
  });
});
