import React from "react";
import { StyledLink } from "@components/globals";
import { BackArrowIcon } from "@components/form-builder/icons";

type BackLinkProps = {
  href: string;
  children: React.ReactNode;
};

export const BackLink = ({ href, children }: BackLinkProps) => {
  return (
    <div className="mb-10">
      <BackArrowIcon className="inline-block mr-2" />
      <StyledLink className="text-[18px]" href={href}>
        {children}
      </StyledLink>
    </div>
  );
};
