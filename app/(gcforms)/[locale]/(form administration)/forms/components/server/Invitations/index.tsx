"use server";
import { acceptInvitation, declineInvitation, retrieveInvitations } from "./actions";
import { Invitation } from "./Invitation";
import { Invitation as InvitationType } from "@prisma/client";

export const Invitations = async () => {
  const invitations = await retrieveInvitations();
  // const handleAcceptInvitation = async (id: string) => {
  //   "use server";
  //   await acceptInvitation(id);
  // };
  // const handleDeclineInvitation = async (id: string) => {
  //   "use server";
  //   await declineInvitation(id);
  // };

  return (
    <div className="mb-4 flex flex-col gap-2">
      {invitations.map((invitation: InvitationType) => {
        return (
          <Invitation
            key="invitation.id"
            // handleAccept={() => alert(invitation.id)}
            // handleDecline={() => alert(invitation.id)}
          />
        );
      })}
    </div>
  );
};
