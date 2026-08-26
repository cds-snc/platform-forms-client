import React, { useId } from "react";
import { cn } from "@lib/utils";
import { useTranslation } from "@i18n/client";

type GroupItem = {
  label: string;
  value: string;
};

export const GroupSelect = ({
  selected,
  groups,
  onChange,
  className,
}: {
  selected: string | null;
  groups: GroupItem[];
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  className?: string;
}) => {
  const labelId = `section-select-${useId()}`;
  const { t } = useTranslation("form-builder");

  return (
    <div className="mb-4">
      <label className="mb-2 block text-sm" id={labelId}>
        {selected === "exit" && <span className="sr-only">{t("disabled")}</span>}{" "}
        {t("logic.gotoPage")}
      </label>
      <select
        disabled={selected === "exit"}
        value={selected || ""}
        data-selected={selected || ""}
        onChange={onChange}
        className={cn(
          "center-right-15px form-builder-dropdown text-black-default my-0 inline-block w-[375px] border-1 border-black p-2 text-sm",
          className,
          selected === "exit" && "cursor-not-allowed opacity-50"
        )}
        aria-labelledby={labelId}
      >
        <option key="none" value="">
          {t("logic.groupSelect.default")}
        </option>
        {groups.map(({ label, value }, i) => {
          return (
            <option key={`${value}-${i}`} value={value}>
              {label}
            </option>
          );
        })}
      </select>
    </div>
  );
};
