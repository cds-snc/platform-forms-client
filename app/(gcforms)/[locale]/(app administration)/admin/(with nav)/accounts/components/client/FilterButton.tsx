"use client";
import { RoundedButton } from "@clientComponents/globals";
import { useRouter } from "next/navigation";

export const FilterButton = ({
  url,
  active,
  children,
}: {
  url: string;
  active: boolean;
  children: string;
}) => {
  const router = useRouter();

  return (
    <RoundedButton
      theme={active ? "primary" : "secondary"}
      onClick={() => {
        router.push(url);
      }}
    >
      {children}
    </RoundedButton>
  );
};
