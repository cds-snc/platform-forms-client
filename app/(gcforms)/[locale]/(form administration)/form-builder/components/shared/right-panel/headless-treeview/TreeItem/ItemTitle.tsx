import { cn } from "@lib/utils";
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
    return <span className="text-gray-500">{t("groups.treeView.emptyPageTextElement")}</span>;
  }

  if (isFormElement && fieldType !== "richText" && title === "") {
    return <span className="text-gray-500">{t("groups.treeView.emptyFormElement")}</span>;
  }

  return (
    <div className={cn("inline-block truncate py-2", "w-full")}>
      {title} <span className="hidden">{item.getId()}</span>
    </div>
  );
};
