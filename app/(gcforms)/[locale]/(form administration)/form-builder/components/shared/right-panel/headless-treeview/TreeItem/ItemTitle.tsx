import { cn } from "@lib/utils";
import { useTranslation } from "@i18n/client";

export const ItemTitle = ({
  title,
  id,
  isFolder,
  isFormElement,
  fieldType,
}: {
  title: string;
  id: string;
  isFolder: boolean;
  isFormElement: boolean;
  fieldType: string;
}) => {
  const { t } = useTranslation("form-builder");

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
    <div className={cn("inline-block truncate py-2", !isFolder ? "w-full" : "w-5/6")}>
      {title} <span className="hidden">{id}</span>
    </div>
  );
};
