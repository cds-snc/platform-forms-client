import { useTranslation } from "@i18n/client";

export const LostKeyLink = () => {
  const { t } = useTranslation("response-api");
  return (
    <p className="relative mt-2 block">
      <button popoverTarget="api-key-popover" className="gc-lost-key-button">
        <span className="underline">{t("loadKeyPage.lostKey.link")}</span>
      </button>
    </p>
  );
};

export const LostKeyPopover = ({ locale, id }: { locale: string; id: string }) => {
  const { t } = useTranslation("response-api");

  return (
    <div
      id="api-key-popover"
      popover="auto"
      className="gc-lost-key-popover-content rounded-xl border-1 border-gray-500 p-10"
    >
      <h2 className="mb-8">{t("loadKeyPage.lostKey.lostKeyTip.title")}</h2>
      <p className="mb-2 font-bold">{t("loadKeyPage.lostKey.lostKeyTip.text1")}</p>
      <p>
        {t("loadKeyPage.lostKey.lostKeyTip.text2")}{" "}
        <a className="underline" href={`/${locale}/form-builder/${id}/settings/api-integration`}>
          {t("loadKeyPage.lostKey.lostKeyTip.link")}.
        </a>
      </p>
    </div>
  );
};
