"use client";
import { StarIcon } from "@serverComponents/icons/StarIcon";
import { accept, decline } from "./actions";
import { Invitation } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useTranslation } from "@i18n/client";
import { Trans } from "react-i18next";
import { Button } from "@clientComponents/globals";
import { toast } from "@formBuilder/components/shared";

export const Invitations = ({ invitations }: { invitations: Invitation[] }) => {
  const { t } = useTranslation("manage-form-access");
  const router = useRouter();

  const handleAcceptInvitation = async (id: string) => {
    const result = await accept(id);
    if (typeof result === "object" && "message" in result) {
      toast.error(t(result.message));
      return;
    }

    router.refresh();
  };

  const handleDeclineInvitation = async (id: string) => {
    await decline(id);
    router.refresh();
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
