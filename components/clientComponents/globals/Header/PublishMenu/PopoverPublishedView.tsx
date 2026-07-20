import Link from "next/link";
import { ClosingDateToggle } from "@formBuilder/[id]/settings/manage/components/close/ClosingDateToggle";
import { PublishedFormLink } from "./PublishedFormLink";
import { EditPublished } from "./EditPublished";

type Translate = (key: string) => string;

export const PopoverPublishedView = ({
  formId,
  t,
  publishedLinks,
  copiedLink,
  onCopy,
  updatingStatus,
  formStatus,
  onPublishedStatusToggle,
  settingsHref,
}: {
  formId: string;
  t: Translate;
  publishedLinks: { en: string; fr: string };
  copiedLink: "en" | "fr" | null;
  onCopy: (href: string) => void;
  updatingStatus: boolean;
  formStatus: "closed" | "open";
  onPublishedStatusToggle: (isChecked: boolean) => void;
  settingsHref: string;
}) => {
  return (
    <div>
      <p className="mb-4 text-sm text-slate-600">{t("publishedViewLinks")}</p>
      <ul className="m-0 list-none space-y-3 p-0">
        <PublishedFormLink
          label={t("publishedEnglish")}
          href={publishedLinks.en}
          openLabel={t("share.open")}
          copyLabel={`${t("share.copy")} ${t("share.enLink")}`}
          copied={copiedLink === "en"}
          copiedLabel={t("publishedCopied")}
          onCopy={onCopy}
        />
        <PublishedFormLink
          label={t("publishedFrench")}
          href={publishedLinks.fr}
          openLabel={t("share.open")}
          copyLabel={`${t("share.copy")} ${t("share.frLink")}`}
          copied={copiedLink === "fr"}
          copiedLabel={t("publishedCopied")}
          onCopy={onCopy}
        />
      </ul>
      <div className="mt-5 border-t border-slate-200 pt-4">
        <p className="mb-2 text-sm font-semibold text-slate-900">{t("closingDate.status")}</p>
        <div className={updatingStatus ? "pointer-events-none opacity-60" : undefined}>
          <ClosingDateToggle
            isChecked={formStatus === "open"}
            setIsChecked={onPublishedStatusToggle}
            onLabel={t("closingDate.closed")}
            offLabel={t("closingDate.open")}
            description={t("closingDate.status")}
          />
        </div>
        <Link
          href={settingsHref}
          className="mt-3 inline-block text-sm font-semibold text-slate-700 underline underline-offset-2 hover:text-slate-900"
        >
          {t("closedFormSettings")}
        </Link>
        <EditPublished t={t} formId={formId} />
      </div>
    </div>
  );
};
