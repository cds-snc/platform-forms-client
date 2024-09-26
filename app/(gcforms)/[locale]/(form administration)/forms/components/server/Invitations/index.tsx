"use client";
import { StarIcon } from "@serverComponents/icons/StarIcon";
import { accept, decline, retrieveInvitations } from "./actions";
import { Invitation } from "@prisma/client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export const Invitations = () => {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const router = useRouter();

  const fetchInvitations = async () => {
    const invitations = await retrieveInvitations();
    setInvitations(invitations);
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  const handleAcceptInvitation = async (id: string) => {
    await accept(id);
    router.refresh();
    fetchInvitations();
  };
  const handleDeclineInvitation = async (id: string) => {
    await decline(id);
    fetchInvitations();
  };

  return (
    <div className="mb-4 flex flex-col gap-2">
      {invitations.map((invitation: Invitation) => {
        return (
          <div key={invitation.id} className="rounded-md bg-violet-50 p-4">
            <StarIcon className="mr-1 inline-block size-8" />
            You have been invited to access a form -{" "}
            <button className="underline" onClick={() => handleAcceptInvitation(invitation.id)}>
              accept
            </button>{" "}
            or{" "}
            <button className="underline" onClick={() => handleDeclineInvitation(invitation.id)}>
              decline
            </button>{" "}
            invitation.
          </div>
        );
      })}
    </div>
  );
};
