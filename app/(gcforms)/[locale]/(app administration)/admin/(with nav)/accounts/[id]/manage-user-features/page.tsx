import { AuthenticatedPage } from "@lib/pages/auth";
import { authorization } from "@lib/privileges";
import { serverTranslation } from "@i18n";
import { getUser } from "@lib/users";
import { UserFeaturesList } from "./components/server/UserFeaturesList";
import { AddUserFeatureModal } from "./components/client/AddUserFeatureModal";
import { checkAll } from "@lib/cache/flags";
import { featureFlagsCheck } from "@lib/cache/userFeatureFlagsCache";

export default AuthenticatedPage<{ id: string }>(
  [authorization.canViewAllUsers, authorization.canAccessFlags],
  async ({ params }) => {
    const { id, locale } = await params;

    const { t } = await serverTranslation("admin-flags", { lang: locale });

    const formUser = await getUser(id);

    const flags = await checkAll();
    const userFlags = await featureFlagsCheck(formUser.id);

    return (
      <div>
        <h1>{t("manageUserFeatures")}</h1>
        <p>
          {t("user")}: {formUser?.name} ({formUser?.email})
        </p>

        <UserFeaturesList formUser={formUser} userFlags={userFlags} />

        <AddUserFeatureModal formUser={formUser} flags={Object.keys(flags)} userFlags={userFlags} />
      </div>
    );
  }
);
