"use client";
import { useState, FormEvent } from "react";
import { getLocalizedProperty } from "@lib/utils";
import { useTranslation } from "@i18n/client";
import { Button } from "@clientComponents/globals";
import { useAccessControl } from "@lib/hooks/useAccessControl";
import { TextInput } from "./components/TextInput";
import { Label } from "@clientComponents/forms";
import { getLatestPublishedTemplates } from "./actions";
import Link from "next/link";

interface DataViewObject {
  id: string;
  titleEn: string;
  titleFr: string;
  isPublished: boolean;
  updatedAt?: string;
  [key: string]: string | boolean | undefined;
}

export const DataView = ({ templates }: { templates: DataViewObject[] }) => {
  const { t, i18n } = useTranslation("admin-templates");

  const sortedByTitle = templates.sort((a, b) => {
    return (a[getLocalizedProperty("title", i18n.language)] as string).localeCompare(
      b[getLocalizedProperty("title", i18n.language)] as string
    );
  });
  const [dataView, setDataView] = useState<DataViewObject[]>(sortedByTitle);

  const getSingleTemplate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const id = data.get("formID");
    const template = templates.filter((template) => template.id === id);
    setDataView(template);
  };

  const clearSearch = async () => {
    setDataView(sortedByTitle);
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
          {dataView.map((template) => {
            return (
              <tr key={template.id} className="border-t-4 border-b-1 border-gray-400">
                <td className="pl-4">{template.id} </td>
                <td className="pl-4">{template[getLocalizedProperty("title", i18n.language)]} </td>
                <td className="text-center">
                  {template.isPublished ? t("view.published") : t("view.draft")}
                </td>
                <td className="text-center">
                  {template.updatedAt ? new Date(template.updatedAt).toLocaleDateString() : ""}
                </td>
                <td className="text-center">
                  <Link
                    href={
                      template.isPublished
                        ? `/${i18n.language}/id/${template.id}`
                        : `/${i18n.language}/form-builder/${template.id}/edit`
                    }
                  >
                    {t("view.view")}
                  </Link>
                </td>
                {ability?.can("update", "FormRecord") && (
                  <td className="text-center">
                    <Link href={`/${i18n.language}/form-builder/${template.id}/settings/manage`}>
                      {t("view.assign")}
                    </Link>
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
