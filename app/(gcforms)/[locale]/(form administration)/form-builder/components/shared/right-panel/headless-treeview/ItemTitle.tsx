import { cn } from "@lib/utils";

import { useTranslation } from "@i18n/client";

export const ItemTitle = ({
  title,
  id,
  isSubElement,
  isFocused,
  isSelected,
}: {
  title: string;
  id: string;
  isSubElement?: boolean;
  isFocused?: boolean;
  isSelected?: boolean;
}) => {
  const { t } = useTranslation("form-builder");

  if (title === "Start") {
    title = t("logic.start");
  }

  if (title === "End") {
    title = t("logic.end");
  }

  return (
    <div
      className={cn(
        "w-5/6 truncate inline-block",
        isSubElement && "ml-4 bg-white border-1 border-slate-500 py-3 px-3 rounded-md w-full",
        isFocused && "border-indigo-700 border-2 font-bold bg-gray-50 text-indigo-700",
        isSelected && "border-2 border-slate-950 bg-white",
        !isSelected && "border-slate-500 hover:border-indigo-700 hover:border-1 hover:bg-indigo-50"
      )}
    >
      {title} <span className="hidden">{id}</span>
    </div>
  );
};
