import { useTranslation } from "@i18n/client";
import { cn } from "@lib/utils";

export const BetaBadge = ({ className }: { className?: string }) => {
  const { t } = useTranslation("form-builder");

  const classes = cn(
    "max-w-fit rounded border-1 border-indigo-700 bg-indigo-500 px-2 py-1 text-sm text-white",
    className
  );
  return (
    <div className={classes}>
      <span className="font-bold"> {t("beta.tag")}</span>
      <span className="font-normal"> {t("beta.text")}</span>
    </div>
  );
};
