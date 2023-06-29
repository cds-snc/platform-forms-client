import React from "react";
import { StyledLink } from "@components/globals";
import { BackArrowIcon } from "@components/form-builder/icons";

type BackLinkProps = {
  href: string;
  children: React.ReactNode;
};

export const BackLink = ({ href, children }: BackLinkProps) => {
  return (
    <>
      <BackArrowIcon className="inline-block mr-2" />
      <StyledLink href={href}>{children}</StyledLink>
    </>
  );
};
