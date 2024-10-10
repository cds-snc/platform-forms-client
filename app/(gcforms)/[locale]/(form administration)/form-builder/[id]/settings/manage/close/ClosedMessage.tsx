import { useTranslation } from "@i18n/client";
import { ClosedDetails } from "@lib/types";
import { Editor } from "@formBuilder/[id]/edit/components/elements/lexical-editor/Editor";

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
      <div className="flex gap-2 ">
        <div className="w-1/2 border-1 border-gray-300">
          <Editor
            lang="en"
            content={closedDetails && closedDetails.messageEn ? closedDetails.messageEn : ""}
            onChange={(value: string) => {
              setClosedDetails({ ...closedDetails, messageEn: value });
            }}
          />
        </div>
        {/* @todo add en / fr tag to editor */}
        <div className="w-1/2 border-1 border-gray-300">
          <Editor
            lang="fr"
            content={closedDetails && closedDetails.messageFr ? closedDetails.messageFr : ""}
            onChange={(value: string) => setClosedDetails({ ...closedDetails, messageFr: value })}
          />
        </div>
      </div>
    </>
  );
};
