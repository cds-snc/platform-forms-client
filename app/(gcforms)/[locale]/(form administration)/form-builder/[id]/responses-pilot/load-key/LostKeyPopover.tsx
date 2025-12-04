import { useTranslation } from "@i18n/client";
import { Close } from "@serverComponents/icons/Close";

export const LostKeyLink = () => {
  const { t } = useTranslation(["response-api"]);
  return (
    <p className="relative mt-2 block">
      <button
        popoverTarget="api-key-popover"
        className="gc-lost-key-button"
        data-testid="lost-key-link"
      >
        <span className="underline">{t("loadKeyPage.lostKey.link")}</span>
      </button>
    </p>
  );
};

export const LostKeyPopover = ({ locale, id }: { locale: string; id: string }) => {
  const { t } = useTranslation("response-api");

  const handleClose = () => {
    const popover = document.getElementById("api-key-popover") as HTMLElement & {
      hidePopover: () => void;
    };
    if (popover?.hidePopover) {
      popover.hidePopover();
    }
  };

  return (
    <div
      id="api-key-popover"
      popover="auto"
      className="gc-lost-key-popover-content rounded-xl border-1 border-gray-500 p-10"
      data-testid="lost-key-popover"
    >
      <h2 className="mb-8" data-testid="lost-key-popover-title">
        {t("loadKeyPage.lostKey.lostKeyTip.title")}
      </h2>
      <p className="mb-2 font-bold">{t("loadKeyPage.lostKey.lostKeyTip.text1")}</p>
      <p>
        {t("loadKeyPage.lostKey.lostKeyTip.text2")}{" "}
        <a className="underline" href={`/${locale}/form-builder/${id}/settings/api-integration`}>
          {t("loadKeyPage.lostKey.lostKeyTip.link")}.
        </a>
      </p>
      <button
        type="button"
        className="group absolute right-0 top-0 mr-4 mt-4 rounded p-2 hover:bg-gray-100 focus:bg-gray-100"
        aria-label={t("loadKeyPage.lostKey.close")}
        onClick={handleClose}
      >
        <Close className="inline-block group-focus:fill-white-default" />
      </button>
    </div>
  );
};
