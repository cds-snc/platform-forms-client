"use client";

import { useRouter } from "next/navigation";
import { ga } from "@lib/client/clientHelpers";
import { logMessage } from "@root/lib/logger";

export const DraftEditLink = ({
  href,
  formId,
  className,
  collaboratorCount,
  children,
}: {
  href: string;
  formId: string;
  className?: string;
  collaboratorCount?: number | null;
  children: React.ReactNode;
}) => {
  const router = useRouter();

  const handleEditClick = async () => {
    try {
      ga("edit_lock_accept_read_only", {
        formId,
        timestamp: Date.now(),
        location: "forms",
        ...(collaboratorCount != null && { userCount: collaboratorCount }),
      });
      router.push(href);
    } catch (error) {
      logMessage.warn(`Error in DraftEditLink for form ${formId}. Error: ${JSON.stringify(error)}`);
    }
  };

  return (
    <>
      <button
        type="button"
        className={className}
        onClick={handleEditClick}
        style={{ cursor: "pointer" }}
      >
        {children}
      </button>
    </>
  );
};
