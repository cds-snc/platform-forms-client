interface Invitation {
  id: string;
  email: string;
  expires: Date;
  templateId: string;
  invitedBy: string;
}

export const mockInvitation = (overrides: Partial<Invitation> = {}): Invitation => {
  const defaultInvitation: Invitation = {
    id: "invitation-id",
    email: "invited@cds-snc.ca",
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    templateId: "template-id",
    invitedBy: "unknown",
  };

  return { ...defaultInvitation, ...overrides };
};
