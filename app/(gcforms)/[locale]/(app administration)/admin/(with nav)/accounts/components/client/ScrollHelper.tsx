"use client";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
export const ScrollHelper = () => {
  const searchParams = useSearchParams();
  const prevUserId = searchParams.get("id");
  useEffect(() => {
    if (prevUserId) {
      // if there is a user id in the query param, scroll to that user card
      const element = document.getElementById(`user-${prevUserId}`);
      element?.scrollIntoView({ behavior: "smooth" });
    }
  }, [prevUserId]);

  return <></>;
};
