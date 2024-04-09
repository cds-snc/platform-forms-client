import { serverTranslation } from "@i18n";
import { LeftNav } from "@clientComponents/admin/LeftNav/NavLink";
import { AccountsIcon } from "@serverComponents/icons/AccountsIcon";
import { SettingsIcon } from "@serverComponents/icons/SettingsIcon";
import { FlagsIcon } from "@serverComponents/icons/FlagsIcon";
import { auth } from "@lib/auth";
import { createAbility } from "@lib/privileges";

export const LeftNavigation = async () => {
  const {
    t,
    i18n: { language },
  } = await serverTranslation(["admin-users", "admin-login", "common"]);

  const session = await auth();
  if (!session) return null;
  const ability = createAbility(session);

  return (
    <nav className="h-full">
      <ul className="m-0 list-none p-0">
        {ability?.can("view", "User") && (
          <li>
            <LeftNav
              testid="accounts"
              href={`/${language}/admin/accounts`}
              title={t("adminNav.users", { ns: "common" })}
            >
              <AccountsIcon />
            </LeftNav>
          </li>
        )}
        {ability?.can("view", "Flag") && (
          <li>
            <LeftNav
              testid="flags"
              href={`/${language}/admin/flags`}
              title={t("adminNav.features", { ns: "common" })}
            >
              <FlagsIcon />
            </LeftNav>
          </li>
        )}
        {ability?.can("view", "Flag") && (
          <li>
            <LeftNav
              testid="settings"
              href={`/${language}/admin/settings`}
              title={t("adminNav.settings", { ns: "common" })}
            >
              <SettingsIcon />
            </LeftNav>
          </li>
        )}
      </ul>
    </nav>
  );
};
