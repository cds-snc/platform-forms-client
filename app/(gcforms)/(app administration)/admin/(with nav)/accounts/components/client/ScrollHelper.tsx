"use client";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
export const ScrollHelper = () => {
  const searchParams = useSearchParams();
  const prevUserId = searchParams.get("focus");

  useEffect(() => {
    if (prevUserId) {
      // If a focused user id is present, scroll that card back into view.
      const element = document.getElementById(`user-${prevUserId}`);

      if (!element) {
        return;
      }

      const headerHeight = document.querySelector("header")?.getBoundingClientRect().height ?? 0;
      const filterListHeight =
        document.getElementById("accountsFilterList")?.getBoundingClientRect().height ?? 0;
      const searchFormHeight =
        document.getElementById("accounts-search-form")?.getBoundingClientRect().height ?? 0;
      const offset = headerHeight + filterListHeight + searchFormHeight + 24;
      const top = element.getBoundingClientRect().top + window.scrollY - offset;

      window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    }
  }, [prevUserId]);

  return <></>;
};
