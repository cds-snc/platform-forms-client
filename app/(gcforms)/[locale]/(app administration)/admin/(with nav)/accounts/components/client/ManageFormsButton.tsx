"use client";
import React from "react";
import Link from "next/link";
import { themes } from "@clientComponents/globals";
import { cn } from "@lib/utils";
import { useTranslation } from "@i18n/client";

export const ManageFormsButton = ({ userId }: { userId: string }) => {
  const {
    t,
    i18n: { language },
  } = useTranslation("admin-users");

  const href = `/${language}/admin/accounts/${userId}/manage-forms`;

  return (
    <Link
      scroll={false}
      href={href}
      prefetch={false}
      className={cn(
        "text-black-default visited:text-black-default active:text-black-default no-underline focus:shadow-none active:shadow-none",
        themes.secondary,
        themes.base
      )}
    >
      {t("manageForms")}
    </Link>
  );
};
