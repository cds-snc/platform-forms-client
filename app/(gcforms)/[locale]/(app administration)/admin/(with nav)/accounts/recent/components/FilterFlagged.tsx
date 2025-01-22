"use client";
import { RoundedButton } from "@clientComponents/globals";
import { useRouter } from "next/navigation";

export const FilterFlagged = ({
  flaggedSignupsCount,
  active,
}: {
  flaggedSignupsCount: number;
  active: boolean;
}) => {
  const router = useRouter();
  return (
    <RoundedButton
      theme={active ? "primary" : "secondary"}
      onClick={() => {
        router.push("/admin/accounts/recent?filter=flagged");
      }}
    >
      <>Accounts flagged ({flaggedSignupsCount})</>
    </RoundedButton>
  );
};
