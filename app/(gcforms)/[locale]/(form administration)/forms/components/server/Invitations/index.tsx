"use client";
import { StarIcon } from "@serverComponents/icons/StarIcon";
import { acceptInvitation, declineInvitation } from "./actions";
import { Invitation as InvitationType } from "@prisma/client";

export const Invitations = ({ invitations }: { invitations: any }) => {
  const handleAcceptInvitation = async (id: string) => {
    await acceptInvitation(id);
  };
  const handleDeclineInvitation = async (id: string) => {
    await declineInvitation(id);
  };

  return (
    <div className="mb-4 flex flex-col gap-2">
      {invitations.map((invitation: InvitationType) => {
        return (
          <div key={invitation.id} className="rounded-md bg-violet-50 p-4">
            <StarIcon className="mr-1 inline-block size-8" />
            You have been invited to access a form -{" "}
            <a href="#" onClick={() => handleAcceptInvitation(invitation.id)}>
              accept
            </a>{" "}
            or{" "}
            <a href="#" onClick={() => handleDeclineInvitation(invitation.id)}>
              decline
            </a>{" "}
            invitation.
          </div>
        );
      })}
    </div>
  );
};
