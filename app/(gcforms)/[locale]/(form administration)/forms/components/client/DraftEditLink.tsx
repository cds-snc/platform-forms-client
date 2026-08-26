"use client";

import { ga } from "@lib/client/clientHelpers";
import Link from "next/link";

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
  return (
    <Link
      href={href}
      className={className}
      onClick={() => {
        ga("edit_lock_accept_read_only", {
          formId,
          timestamp: Date.now(),
          location: "forms",
          ...(collaboratorCount != null && { userCount: collaboratorCount }),
        });
      }}
      prefetch={false}
    >
      {children}
    </Link>
  );
};
