"use client";

import { useState, useTransition } from "react";
import { useTranslation } from "@i18n/client";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@clientComponents/globals";
import type { UserSearchProperty, UserSearchState } from "@lib/users";
import { buildAccountsSearchParams, DEFAULT_USER_SEARCH_PROPERTY } from "../../lib/search";

type AccountsSearchFormProps = {
  initialQuery: string;
  initialProperty: UserSearchProperty;
  initialUserState?: UserSearchState;
};

export const AccountsSearchForm = ({
  initialQuery,
  initialProperty,
  initialUserState,
}: AccountsSearchFormProps) => {
  "use memo";
  const { t } = useTranslation("admin-users");
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState(initialQuery);
  const [property, setProperty] = useState<UserSearchProperty>(initialProperty);
  const [userState, setUserState] = useState<UserSearchState | "">(initialUserState ?? "");
  const selectClassName =
    "w-full appearance-none rounded-md border-2 border-slate-700 bg-white p-2 pr-12";
  const canClearSearch =
    query.length > 0 || userState.length > 0 || property !== DEFAULT_USER_SEARCH_PROPERTY;

  const navigateWithSearch = ({
    nextQuery,
    nextProperty,
    nextUserState,
  }: {
    nextQuery: string;
    nextProperty: UserSearchProperty;
    nextUserState?: UserSearchState;
  }) => {
    const params = buildAccountsSearchParams({
      query: nextQuery,
      property: nextProperty,
      userState: nextUserState,
      page: 1,
    });

    const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    startTransition(() => {
      router.replace(nextUrl);
    });
  };

  const clearSearch = () => {
    setQuery("");
    setProperty(DEFAULT_USER_SEARCH_PROPERTY);
    setUserState("");
    startTransition(() => {
      router.replace(pathname);
    });
  };

  return (
    <form
      id="accounts-search-form"
      className="mb-8 max-w-6xl rounded-lg border border-slate-300 bg-slate-50 p-4"
      onSubmit={(event) => {
        event.preventDefault();
        navigateWithSearch({
          nextQuery: query,
          nextProperty: property,
          nextUserState: userState || undefined,
        });
      }}
    >
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-[20rem] flex-[2.4_1_0%]">
          <label htmlFor="accounts-query" className="sr-only">
            {t("search.label")}
          </label>
          <input
            id="accounts-query"
            type="search"
            className="w-full rounded-md border-2 border-slate-700 bg-white p-2"
            placeholder={t("search.placeholder")}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label={t("search.ariaLabel")}
          />
        </div>

        <div className="min-w-44 flex-1">
          <label htmlFor="accounts-property" className="sr-only">
            {t("search.propertyLabel")}
          </label>
          <div className="relative">
            <select
              id="accounts-property"
              className={selectClassName}
              value={property}
              onChange={(event) => setProperty(event.target.value as UserSearchProperty)}
            >
              <option value="all">{t("search.properties.all")}</option>
              <option value="id">{t("search.properties.id")}</option>
              <option value="name">{t("search.properties.name")}</option>
              <option value="email">{t("search.properties.email")}</option>
            </select>
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-slate-700"
            >
              <svg
                width="16"
                height="10"
                viewBox="0 0 16 10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M1 1L8 8L15 1" stroke="currentColor" strokeWidth="2" />
              </svg>
            </span>
          </div>
        </div>

        <div className="min-w-44 flex-1">
          <label htmlFor="accounts-status" className="sr-only">
            {t("search.statusLabel")}
          </label>
          <div className="relative">
            <select
              id="accounts-status"
              className={selectClassName}
              value={userState}
              onChange={(event) => setUserState(event.target.value as UserSearchState | "")}
            >
              <option value="">{t("accountsFilter.all")}</option>
              <option value="active">{t("accountsFilter.active")}</option>
              <option value="deactivated">{t("accountsFilter.deactivated")}</option>
            </select>
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-slate-700"
            >
              <svg
                width="16"
                height="10"
                viewBox="0 0 16 10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M1 1L8 8L15 1" stroke="currentColor" strokeWidth="2" />
              </svg>
            </span>
          </div>
        </div>

        <Button
          type="submit"
          className="h-12 w-32 justify-center px-4 py-2"
          theme="primary"
          disabled={isPending}
        >
          {t("search.submit")}
        </Button>

        <Button
          type="button"
          className="h-12 w-32 justify-center px-4 py-2"
          theme="secondary"
          disabled={isPending || !canClearSearch}
          onClick={clearSearch}
        >
          {t("search.clear")}
        </Button>
      </div>
    </form>
  );
};
