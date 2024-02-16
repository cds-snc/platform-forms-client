"use client";
import React from "react";
import { StyledLink } from "@clientComponents/globals";
import { BackArrowIcon } from "@serverComponents/icons";

type BackLinkProps = {
  href: string;
  children: React.ReactNode;
};

export const BackLink = ({ href, children }: BackLinkProps) => {
  return (
    <div className="mb-10">
      <BackArrowIcon className="mr-2 inline-block" />
      <StyledLink
        className="text-lg text-slate-800 visited:text-slate-800 active:text-white"
        href={href}
      >
        {children}
      </StyledLink>
    </div>
  );
};
