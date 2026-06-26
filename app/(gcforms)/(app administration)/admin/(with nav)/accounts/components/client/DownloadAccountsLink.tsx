"use client";

import Link from "next/link";
import { Tooltip } from "@formBuilder/components/shared/Tooltip";
import { DownloadIcon } from "@serverComponents/icons";

export const DownloadAccountsLink = ({ href, label }: { href: string; label: string }) => {
  return (
    <Tooltip.Simple text={label} side="right">
      <Link
        href={href}
        aria-label={label}
        className="focus:outline-gcds-blue-vivid flex size-10 items-center justify-center rounded-md text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 focus:outline-2 focus:outline-offset-2"
      >
        <DownloadIcon className="size-8 fill-current" />
      </Link>
    </Tooltip.Simple>
  );
};
