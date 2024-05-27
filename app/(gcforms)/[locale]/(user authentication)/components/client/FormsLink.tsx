"use client";
import Link from "next/link";
import { useTranslation } from "@i18n/client";
import { useSession } from "next-auth/react";
export const FormsLink = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation("common");

  const { status, data: session } = useSession();

  // Only show for authenticated users
  if (status !== "authenticated") return null;

  // Only show for users who have accepted the acceptable use policy
  if (session.user?.acceptableUse === false) return null;

  return (
    <div className="text-base font-normal not-italic md:text-sm">
      <Link id="forms_link" href={`/${language}/forms`}>
        {t("adminNav.myForms")}
      </Link>
    </div>
  );
};
