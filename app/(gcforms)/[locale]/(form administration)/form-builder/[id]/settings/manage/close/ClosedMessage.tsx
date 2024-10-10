import { useTranslation } from "@i18n/client";
import { ClosedDetails } from "@lib/types";

type ClosedMessageProps = {
  closedDetails: ClosedDetails | null;
  setClosedDetails: (details: ClosedDetails) => void;
};

export const ClosedMessage = ({ closedDetails, setClosedDetails }: ClosedMessageProps) => {
  const { t } = useTranslation("form-builder");
  return (
    <>
      <p className="mb-2 font-bold">{t("closingDate.message.title")}</p>
      <p className="mb-4">{t("closingDate.message.text1")}</p>

      <div>
        <textarea
          className="mr-10 border-1"
          value={closedDetails && closedDetails.messageEn ? closedDetails.messageEn : ""}
          onChange={(e) => setClosedDetails({ ...closedDetails, messageEn: e.target.value })}
        />
        <textarea
          className="border-1"
          value={closedDetails && closedDetails.messageFr ? closedDetails.messageFr : ""}
          onChange={(e) => setClosedDetails({ ...closedDetails, messageFr: e.target.value })}
        />
      </div>
    </>
  );
};
