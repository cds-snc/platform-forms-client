import { ViewTransition } from "react";
import { AuthenticatedPage } from "@lib/pages/auth";
import { authorization } from "@lib/privileges";
import { serverTranslation } from "@i18n";
import { getUser } from "@lib/users";
import { UserFeaturesList } from "./components/server/UserFeaturesList";
import { AddUserFeatureModal } from "./components/client/AddUserFeatureModal";
import { checkAll } from "@lib/cache/flags";
import { getUserFeatureFlags } from "@lib/userFeatureFlags";
import { UserNameEmail } from "@root/app/(gcforms)/[locale]/(form administration)/form-builder/components/shared/account/UserNameEmail";
import { BackLink } from "@root/components/clientComponents/admin/LeftNav/BackLink";
import { buildAccountsSearchParams, parseAccountsSearchParams } from "../../lib/search";
import {
  accountsRouteTransition,
  getAccountIdentityTransitionName,
} from "../../lib/viewTransitions";

export default AuthenticatedPage<{ id: string }>(
  [authorization.canViewAllUsers, authorization.canAccessFlags],
  async ({ params, searchParams }) => {
    const { id, locale } = await params;
    const resolvedSearchParams = await searchParams;

    const { t } = await serverTranslation(["admin-flags", "admin-users"], { lang: locale });

    const formUser = await getUser(id);

    const flags = await checkAll();
    const userFlags = await getUserFeatureFlags(formUser.id);
    const backToAccountsState = parseAccountsSearchParams(resolvedSearchParams);
    const backToAccountsParams = buildAccountsSearchParams(backToAccountsState);
    backToAccountsParams.set("focus", formUser.id);

    return (
      <ViewTransition {...accountsRouteTransition}>
        <div>
          <BackLink
            href={`/${locale}/admin/accounts?${backToAccountsParams.toString()}`}
            transitionTypes={["nav-back"]}
          >
            {t("backToAccounts")}
          </BackLink>
          <h1 className="mb-6 flex flex-col gap-4 border-0">{t("manageUserFeatures")}</h1>

          <div className="mb-12">
            <ViewTransition name={getAccountIdentityTransitionName(formUser.id)}>
              <UserNameEmail name={formUser.name || ""} email={formUser.email} />
            </ViewTransition>
          </div>

          <div className="mb-4 flex max-w-2xl flex-col rounded-md border-2 border-black p-4">
            <UserFeaturesList formUser={formUser} userFlags={userFlags} />

            <AddUserFeatureModal
              formUser={formUser}
              flags={Object.keys(flags)}
              userFlags={userFlags}
            />
          </div>
        </div>
      </ViewTransition>
    );
  }
);
