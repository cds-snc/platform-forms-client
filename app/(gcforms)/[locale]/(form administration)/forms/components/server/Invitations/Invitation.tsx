"use client";

import { StarIcon } from "@serverComponents/icons/StarIcon";

type InvitationProps = {
  handleAccept: () => Promise<void>;
  handleDecline: () => Promise<void>;
};

export const Invitation = () => {
  return (
    <div className="rounded-md bg-violet-50 p-4">
      <StarIcon className="mr-1 inline-block size-8" />
      You have been invited to access a form -{" "}
      <a href="#" onClick={() => alert("Huzzah")}>
        accept
      </a>{" "}
      or{" "}
      <a href="#" onClick={() => alert("huzzah")}>
        decline
      </a>{" "}
      invitation.
    </div>
  );
};
