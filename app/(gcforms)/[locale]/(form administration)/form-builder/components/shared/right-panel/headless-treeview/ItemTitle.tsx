import { cn } from "@lib/utils";
import { useTranslation } from "@i18n/client";

export const ItemTitle = ({
  title,
  id,
  isFolder,
}: {
  title: string;
  id: string;
  isFolder: boolean;
}) => {
  const { t } = useTranslation("form-builder");

  if (title === "Start") {
    title = t("logic.start");
  }

  if (title === "End") {
    title = t("logic.end");
  }

  return (
    <div className={cn("inline-block truncate", !isFolder && "w-full")}>
      {title} <span className="hidden">{id}</span>
    </div>
  );
};
