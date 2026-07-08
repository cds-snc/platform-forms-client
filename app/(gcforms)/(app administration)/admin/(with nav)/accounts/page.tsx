import { Suspense, use, ViewTransition } from "react";
import { AuthenticatedPage } from "@lib/pages/auth";
import { authorization } from "@lib/privileges";
import { Loader } from "@clientComponents/globals/Loader";
import { ManageAccountsIcon } from "@serverComponents/icons/ManageAccountsIcon";
import { UsersList } from "./components/server/UsersList";
import { AccountsSearchForm } from "./components/client/AccountsSearchForm";
import { DownloadAccountsButtons } from "./components/server/DownloadAccountsButtons";
import { parseAccountsSearchParams } from "./lib/search";
import { accountsRouteTransition } from "./lib/viewTransitions";
import { I18n } from "@root/i18n";
import { PageTitle } from "@root/components/serverComponents/globals/PageTitle";

const AccountsPageContent = ({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const { locale } = use(params);
  const resolvedSearchParams = use(searchParams);

  const searchState = parseAccountsSearchParams(resolvedSearchParams);

  return (
    <ViewTransition {...accountsRouteTransition}>
      <PageTitle key="accounts" namespace="admin-users" />
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <ManageAccountsIcon className="size-12 fill-slate-700" />
        <h1 className="mb-0 border-0">
          <I18n i18nKey="accounts" namespace="admin-users" />
        </h1>
        <DownloadAccountsButtons locale={locale} />
      </div>
      <AccountsSearchForm
        key={JSON.stringify({
          query: searchState.query,
          property: searchState.property,
          userState: searchState.userState,
        })}
        initialQuery={searchState.query}
        initialProperty={searchState.property}
        initialUserState={searchState.userState}
      />
      <Suspense key={JSON.stringify(searchState)} fallback={<Loader />}>
        <UsersList
          page={searchState.page}
          query={searchState.query}
          property={searchState.property}
          userState={searchState.userState}
          hasFilters={searchState.hasFilters}
        />
      </Suspense>
    </ViewTransition>
  );
};

export default AuthenticatedPage(
  [authorization.canViewAllUsers, authorization.canAccessPrivileges],
  async ({ params, searchParams }) => {
    return <AccountsPageContent params={params} searchParams={searchParams} />;
  }
);
