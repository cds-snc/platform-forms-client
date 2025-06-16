"use client";

import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export const UserSearch = () => {
  const { t } = useTranslation("admin-users");
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Get the current query from the URL
  const currentQuery = searchParams.get("query") || "";
  const [searchTerm, setSearchTerm] = useState(currentQuery);

  // Debounce the search to avoid too many URL updates
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm === currentQuery) return;

      // Create new URLSearchParams
      const params = new URLSearchParams(searchParams);

      // Update or delete the query parameter
      if (searchTerm) {
        params.set("query", searchTerm);
      } else {
        params.delete("query");
      }

      // Keep the active/deactivated filter if it exists
      const filter = searchParams.get("filter");
      if (filter) {
        params.set("filter", filter);
      }

      // Update the URL with the new search params
      router.replace(`${pathname}?${params.toString()}`);
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchTerm, currentQuery, router, pathname, searchParams]);

  return (
    <div className="mb-4 w-2/3 max-w-2xl">
      <label htmlFor="user-search" className="mb-2 block font-bold">
        {t("search.label")}
      </label>
      <input
        id="user-search"
        type="text"
        className="w-full rounded-md border-2 border-slate-700 p-2"
        placeholder={t("search.placeholder")}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        aria-label={t("search.ariaLabel")}
      />
    </div>
  );
};
