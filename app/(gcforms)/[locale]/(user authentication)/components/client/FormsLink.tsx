"use client";
import Link from "next/link";
import { useTranslation } from "@i18n/client";
import { useSession } from "next-auth/react";
export const FormsLink = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation("common");

  const session = useSession();

  // Only show for authenticated users
  if (session.status !== "authenticated") return null;

  return (
    <div className="text-base font-normal not-italic md:text-sm">
      <Link id="forms_link" href={`/${language}/forms`}>
        {t("adminNav.myForms")}
      </Link>
    </div>
  );
};
