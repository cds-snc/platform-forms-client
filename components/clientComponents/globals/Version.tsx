"use client";
import packageJson from "../../../package.json";
import { cn } from "@lib/utils";
import { useTranslation } from "@i18n";

const deploymentId = process.env.NEXT_DEPLOYMENT_ID || "local";

export const Version = ({ isFormBuilder }: { isFormBuilder: boolean }) => {
  const { version } = packageJson;
  const { t } = useTranslation("common");

  return (
    <div
      className={cn(
        isFormBuilder && "mt-2 text-sm text-slate-800",
        !isFormBuilder && "mr-6 inline-block text-sm text-slate-800"
      )}
    >
      {t("version")}: {version} <span className="hidden"> - {deploymentId}</span>
    </div>
  );
};
