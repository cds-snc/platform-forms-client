"use client";
import { useState, FormEvent } from "react";
import { getLocalizedProperty } from "@lib/utils";
import { useTranslation } from "@i18n/client";
import { useRouter } from "next/navigation";
import { Button } from "@clientComponents/globals";
import { useAccessControl } from "@lib/hooks/useAccessControl";
import { TextInput } from "./components/TextInput";
import { Label } from "@clientComponents/forms";
import { getLatestPublishedTemplates } from "./actions";

interface DataViewObject {
  id: string;
  titleEn: string;
  titleFr: string;
  isPublished: boolean;
  updatedAt?: string;
  [key: string]: string | boolean | undefined;
}

enum WhereToRedirect {
  Form,
  Settings,
  Users,
}

export const DataView = ({ templates }: { templates: DataViewObject[] }) => {
  const { t, i18n } = useTranslation("admin-templates");
  const [dataView, setDataView] = useState<DataViewObject[]>(templates);
  const router = useRouter();

  const redirectTo = async (where: WhereToRedirect, formID: string) => {
    let pathname = "";
    switch (where) {
      case WhereToRedirect.Form:
        pathname = `/${i18n.language}/id/${formID}`;
        break;
      case WhereToRedirect.Users:
        pathname = `/${i18n.language}/form-builder/${formID}/settings/manage`;
        break;
    }
    router.push(pathname);
  };

  const getSingleTemplate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const id = data.get("formID");
    const template = templates.filter((template) => template.id === id);
    setDataView(template);
  };

  const clearSearch = async () => {
    setDataView(templates);
  };

  const getLatestPublished = async () => {
    const sortedList = await getLatestPublishedTemplates();
    setDataView(sortedList);
  };

  const { ability } = useAccessControl();

  return (
    <>
      <h1 className="border-0 mb-0">{t("view.title")}</h1>
      <div className="flex flex-row">
        <form className="m-6 basis-3/4" onSubmit={getSingleTemplate}>
          <Label id={"label-formID"} htmlFor={"formID"} className="w-32">
            {t("view.formID")}
          </Label>

          <TextInput id="formID" type="text" name="formID" error={""} />

          <div className="flex flex-row gap-3 pt-4">
            <Button type="submit" className="ml-2">
              {t("view.search")}
            </Button>
            <div>
              <Button type="button" onClick={clearSearch}>
                {t("view.clear")}
              </Button>
            </div>
          </div>
        </form>
        <Button onClick={getLatestPublished} className="h-12">
          {t("view.latestPublished")}
        </Button>
      </div>
      <table className="w-full table-auto  border-4 border-gray-400">
        <thead className="border-4 border-gray-400">
          <tr>
            <th>{t("view.formID")}</th>
            <th>{t("view.formTitle")}</th>
            <th>{t("view.status")}</th>
            <th>{t("view.updatedAt")}</th>
            <th className="w-1/12">{t("view.view")}</th>
            <th className="w-1/12">{t("view.users")}</th>
          </tr>
        </thead>
        <tbody>
          {dataView
            .sort((a, b) => {
              return (a[getLocalizedProperty("title", i18n.language)] as string).localeCompare(
                b[getLocalizedProperty("title", i18n.language)] as string
              );
            })
            .map((template) => {
              return (
                <tr key={template.id} className="border-t-4 border-b-1 border-gray-400">
                  <td className="pl-4">{template.id} </td>
                  <td className="pl-4">
                    {template[getLocalizedProperty("title", i18n.language)]}{" "}
                  </td>
                  <td className="text-center">
                    {template.isPublished ? t("view.published") : t("view.draft")}
                  </td>
                  <td className="text-center">
                    {template.updatedAt ? new Date(template.updatedAt).toLocaleDateString() : ""}
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
                </tr>
              );
            })}
        </tbody>
      </table>
    </>
  );
};
