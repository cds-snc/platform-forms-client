import { useTranslation } from "@i18n/client";

import { ItemProps } from "../types";

import { useElementType } from "../hooks/useElementType";

export const ItemTitle = ({ item }: ItemProps) => {
  const { t } = useTranslation("form-builder");
  const { isFormElement, fieldType } = useElementType(item);

  let title = item.getItemName() || "";

  if (title === "Start") {
    title = t("logic.start");
  }

  if (title === "End") {
    title = t("logic.end");
  }

  if (isFormElement && fieldType === "richText" && title === "") {
    return (
      <div className="inline-block w-full truncate py-2">
        <span className="text-gray-500">{t("groups.treeView.emptyPageTextElement")}</span>
      </div>
    );
  }

  if (isFormElement && title === "") {
    return (
      <div className="inline-block w-full truncate py-2">
        <span className="text-gray-500">{t("groups.treeView.emptyFormElement")}</span>
      </div>
    );
  }

  return (
    <div className="inline-block w-full truncate py-2">
      {title} <span className="hidden">{item.getId()}</span>
    </div>
  );
};
