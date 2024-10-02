interface Invitation {
  id: string;
  email: string;
}

export const mockInvitation = (overrides: Partial<Invitation> = {}): Invitation => {
  const defaultInvitation: Invitation = {
    id: "invitation-id",
    email: "invited@cds-snc.ca",
  };

  return { ...defaultInvitation, ...overrides };
};
