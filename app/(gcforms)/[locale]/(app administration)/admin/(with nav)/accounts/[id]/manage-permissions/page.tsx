import { serverTranslation } from "@i18n";
import { requireAuthentication } from "@lib/auth";
import { checkPrivilegesAsBoolean, getAllPrivileges } from "@lib/privileges";
import { getUser } from "@lib/users";
import { ManagePermissions } from "./clientSide";
import { Metadata } from "next";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { t } = await serverTranslation("admin-users", { lang: locale });
  return {
    title: `${t("managePermissions")}`,
  };
}

export default async function Page({ params: { id } }: { params: { id: string } }) {
  const { user } = await requireAuthentication();
  checkPrivilegesAsBoolean(
    user.ability,
    [
      { action: "view", subject: "User" },
      { action: "view", subject: "Privilege" },
    ],
    { logic: "all", redirect: true }
  );
  const formUser = await getUser(user.ability, id as string);

  const allPrivileges = (await getAllPrivileges(user.ability)).map(
    ({ id, name, descriptionFr, descriptionEn }) => ({
      id,
      name,
      descriptionFr,
      descriptionEn,
    })
  );

  return <ManagePermissions {...{ formUser, allPrivileges }} />;
}
