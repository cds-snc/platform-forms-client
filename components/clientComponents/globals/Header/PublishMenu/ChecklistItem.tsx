import { CancelIcon, CircleCheckIcon } from "@root/components/serverComponents/icons";
import Link from "next/link";

export const ChecklistItem = ({
  checked,
  href,
  label,
  onClick,
}: {
  checked: boolean;
  href: string;
  label: string;
  onClick: (href: string) => void;
}) => {
  return (
    <li className="flex items-center gap-3">
      {checked ? (
        <CircleCheckIcon className="size-7 shrink-0 fill-green-700" />
      ) : (
        <CancelIcon className="size-7 shrink-0 fill-slate-500" />
      )}
      <Link
        href={href}
        onClick={() => onClick(href)}
        className="text-xl text-slate-900 no-underline hover:underline"
      >
        {label}
      </Link>
    </li>
  );
};
