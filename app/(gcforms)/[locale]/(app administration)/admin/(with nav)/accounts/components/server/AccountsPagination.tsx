import Link from "next/link";
import type { UserSearchProperty, UserSearchState } from "@lib/users";
import { serverTranslation } from "@i18n";
import { buildAccountsSearchParams } from "../../lib/search";

type AccountsPaginationProps = {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  query: string;
  property: UserSearchProperty;
  userState?: UserSearchState;
};

export const AccountsPagination = async ({
  page,
  pageSize,
  totalCount,
  totalPages,
  query,
  property,
  userState,
}: AccountsPaginationProps) => {
  const {
    t,
    i18n: { language },
  } = await serverTranslation("admin-users");

  if (totalPages <= 1) {
    return null;
  }

  const start = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalCount);
  const previousPage = page - 1;
  const nextPage = page + 1;
  const previousHref = `/${language}/admin/accounts?${buildAccountsSearchParams({
    page: previousPage,
    query,
    property,
    userState,
  }).toString()}`;
  const nextHref = `/${language}/admin/accounts?${buildAccountsSearchParams({
    page: nextPage,
    query,
    property,
    userState,
  }).toString()}`;

  return (
    <nav
      className="sticky top-4 z-10 mb-4 w-full max-w-6xl bg-linear-to-b from-white via-white to-transparent pb-6"
      aria-label={t("search.pagination.ariaLabel")}
    >
      <div className="flex items-center justify-between rounded-md border border-slate-300 bg-white px-4 py-3 shadow-sm">
        <p className="m-0 text-sm text-slate-700">
          {t("search.resultsSummary", {
            start,
            end,
            total: totalCount,
          })}
        </p>
        <div className="flex gap-3">
          <Link
            href={previousHref}
            className={`pt-2 pr-2 pb-2 font-semibold text-slate-800 underline underline-offset-4 ${
              page <= 1 ? "pointer-events-none opacity-50" : ""
            }`}
            aria-disabled={page <= 1}
          >
            {t("search.pagination.previous")}
          </Link>
          <Link
            href={nextHref}
            className={`px-2 py-2 font-semibold text-slate-800 underline underline-offset-4 ${
              page >= totalPages ? "pointer-events-none opacity-50" : ""
            }`}
            aria-disabled={page >= totalPages}
          >
            {t("search.pagination.next")}
          </Link>
        </div>
      </div>
    </nav>
  );
};
