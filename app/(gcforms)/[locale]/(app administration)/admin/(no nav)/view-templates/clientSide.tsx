"use client";
import { getLocalizedProperty } from "@lib/utils";
import { useTranslation } from "@i18n/client";
import { useRouter } from "next/navigation";
import axios from "axios";
import { logMessage } from "@lib/logger";
import { Button } from "@clientComponents/globals";
import { useRefresh } from "@lib/hooks/useRefresh";
import { useAccessControl } from "@lib/hooks/useAccessControl";

interface DataViewProps {
  templates: Array<{
    id: string;
    titleEn: string;
    titleFr: string;
    isPublished: boolean;
    [key: string]: string | boolean;
  }>;
}

enum WhereToRedirect {
  Form,
  Settings,
  Users,
}

const handlePublish = async (formID: string, isPublished: boolean) => {
  return axios({
    url: `/api/templates/${formID}`,
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    data: { isPublished },
    timeout: process.env.NODE_ENV === "production" ? 60000 : 0,
  }).catch((err) => logMessage.error(err));
};

export const DataView = (props: DataViewProps): React.ReactElement => {
  const { t, i18n } = useTranslation("admin-templates");
  const { templates } = props;
  const router = useRouter();
  const { refreshData } = useRefresh();

  const redirectTo = async (where: WhereToRedirect, formID: string) => {
    let pathname = "";
    switch (where) {
      case WhereToRedirect.Form:
        pathname = `/${i18n.language}/id/${formID}`;
        break;
      case WhereToRedirect.Settings:
        pathname = `/${i18n.language}/id/${formID}/settings`;
        break;
      case WhereToRedirect.Users:
        pathname = `/${i18n.language}/id/${formID}/users`;
        break;
    }
    router.push(pathname);
  };

  const { ability } = useAccessControl();

  return (
    <>
      <h1 className="border-0 mb-0">{t("view.title")}</h1>
      <table className="w-full table-auto  border-4 border-gray-400">
        <thead className="border-4 border-gray-400">
          <tr>
            <th>{t("view.formTitle")}</th>
            <th>{t("view.status")}</th>
            <th className="w-1/12">{t("view.update")}</th>
            <th className="w-1/12">{t("view.view")}</th>
            <th className="w-1/12">{t("view.users")}</th>
            <th className="w-1/12">{t("view.publishForm")}</th>
          </tr>
        </thead>
        <tbody>
          {templates
            .sort((a, b) => {
              return (a[getLocalizedProperty("title", i18n.language)] as string).localeCompare(
                b[getLocalizedProperty("title", i18n.language)] as string
              );
            })
            .map((template) => {
              return (
                <tr key={template.id} className="border-t-4 border-b-1 border-gray-400">
                  <td className="pl-4">
                    {template[getLocalizedProperty("title", i18n.language)]}{" "}
                  </td>
                  <td className="text-center">
                    {template.isPublished ? t("view.published") : t("view.draft")}
                  </td>
                  <td className="text-center">
                    {ability?.can("update", "FormRecord") && (
                      <Button
                        theme="link"
                        onClick={async () => redirectTo(WhereToRedirect.Settings, template.id)}
                      >
                        {t("view.update")}
                      </Button>
                    )}
                  </td>
                  <td className="text-center">
                    <Button
                      onClick={async () => redirectTo(WhereToRedirect.Form, template.id)}
                      theme="link"
                    >
                      {t("view.view")}
                    </Button>
                  </td>
                  {ability?.can("update", "FormRecord") && (
                    <td className="text-center">
                      <Button
                        theme="link"
                        onClick={async () => redirectTo(WhereToRedirect.Users, template.id)}
                      >
                        {t("view.assign")}
                      </Button>
                    </td>
                  )}
                  {ability?.can("update", "FormRecord", "isPublished") && (
                    <td>
                      <Button
                        theme="link"
                        onClick={async () => {
                          await handlePublish(template.id, !template.isPublished);
                          refreshData();
                        }}
                        className=""
                      >
                        {template.isPublished ? t("view.unpublishForm") : t("view.publishForm")}
                      </Button>
                    </td>
                  )}
                </tr>
              );
            })}
        </tbody>
      </table>
    </>
  );
};
