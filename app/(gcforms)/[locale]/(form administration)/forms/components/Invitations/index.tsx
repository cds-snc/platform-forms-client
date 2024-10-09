"use client";
import { StarIcon } from "@serverComponents/icons/StarIcon";
import { accept, decline, retrieveInvitations } from "./actions";
import { Invitation } from "@prisma/client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@i18n/client";
import { Trans } from "react-i18next";
import { Button } from "@clientComponents/globals";

export const Invitations = () => {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const { t } = useTranslation("manage-form-access");
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

  const AcceptLink = ({ id, children }: { id: string; children?: string }) => {
    return (
      <Button theme="link" onClick={() => handleAcceptInvitation(id)}>
        {children}
      </Button>
    );
  };

  const DeclineLink = ({ id, children }: { id: string; children?: string }) => {
    return (
      <Button theme="link" onClick={() => handleDeclineInvitation(id)}>
        {children}
      </Button>
    );
  };

  return (
    <div className="mb-4 flex flex-col gap-2">
      {invitations.map((invitation: Invitation) => {
        return (
          <div key={invitation.id} className="rounded-md bg-violet-50 p-4">
            <StarIcon className="mr-1 inline-block size-8" />
            <Trans
              t={t}
              i18nKey="invitationToAccessForm"
              components={{
                accept: <AcceptLink id={invitation.id} />,
                decline: <DeclineLink id={invitation.id} />,
              }}
            />
          </div>
        );
      })}
    </div>
  );
};
