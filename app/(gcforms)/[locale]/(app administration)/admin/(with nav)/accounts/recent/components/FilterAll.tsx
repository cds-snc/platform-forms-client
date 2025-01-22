"use client";
import { RoundedButton } from "@clientComponents/globals";
import { useRouter } from "next/navigation";

export const FilterAll = ({
  recentSignupsCount,
  active,
}: {
  recentSignupsCount: number;
  active: boolean;
}) => {
  const router = useRouter();
  return (
    <RoundedButton
      theme={active ? "primary" : "secondary"}
      onClick={() => {
        router.push("/admin/accounts/recent");
      }}
    >
      <>All ({recentSignupsCount})</>
    </RoundedButton>
  );
};
