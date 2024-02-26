"use client";
import React, { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@lib/utils";
import { useTranslation } from "@i18n/client";
import { languages } from "@i18n/settings";

// TODO: probably should be updated to use the <LinkButton.. component some time

// TODO: consider "repurposing" style to be more generic so this can be a NavLink (left/right/top..)

export const NavLink = ({
  href,
  id = "",
  children,
  isActive,
  onClick,
}: {
  href: string;
  id?: string;
  children: ReactNode | ReactNode[];
  isActive: boolean;
  onClick?: () => void;
}) => {
  const {
    i18n: { language },
  } = useTranslation();

  const linkHref = languages.some((loc) => href.startsWith(`/${loc}`))
    ? href
    : `/${language}${href}`;

  return (
    <Link
      id={id}
      href={linkHref}
      as={linkHref}
      className={cn(
        isActive && "font-bold",
        "group mb-2 block rounded py-1 pl-2 pr-0 text-black-default no-underline visited:text-black-default hover:text-blue-hover focus:bg-blue-hover focus:text-white-default active:bg-blue-hover active:text-white-default active:no-underline laptop:pr-2"
      )}
      {...(isActive && { "aria-current": "page" })}
      onClick={onClick ? () => onClick() : undefined}
    >
      {children}
    </Link>
  );
};
