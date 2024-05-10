"use client";
import React from "react";
import Link from "next/link";
import { BackArrowIcon } from "@serverComponents/icons";

type BackLinkProps = {
  href: string;
  children: React.ReactNode;
};

export const BackLink = ({ href, children }: BackLinkProps) => {
  return (
    <div className="mb-10">
      <BackArrowIcon className="mr-2 inline-block" />
      <Link className="text-lg text-slate-800 visited:text-slate-800 active:text-white" href={href}>
        {children}
      </Link>
    </div>
  );
};
