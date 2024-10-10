import { useTranslation } from "@i18n/client";
import { ClosedDetails } from "@lib/types";
import { Editor } from "@formBuilder/[id]/edit/components/elements/lexical-editor/Editor";

import { Language } from "@lib/types/form-builder-types";
import React, { ReactElement } from "react";

type ClosedMessageProps = {
  closedDetails: ClosedDetails | null;
  setClosedDetails: (details: ClosedDetails) => void;
};

export const LanguageLabel = ({
  id,
  children,
  lang,
}: {
  id: string;
  children: ReactElement;
  lang: Language;
}) => {
  return (
    <div
      id={id}
      className={`absolute bottom-0 right-0 mb-[1px] mr-[1px] rounded-sm border px-2 text-sm${
        lang === "en" ? `border-violet-400 bg-violet-300` : "border-fucsia-400 bg-fuchsia-300"
      }`}
    >
      {children}
    </div>
  );
};

export const ClosedMessage = ({ closedDetails, setClosedDetails }: ClosedMessageProps) => {
  const { t } = useTranslation("form-builder");
  return (
    <>
      <p className="mb-2 font-bold">{t("closingDate.message.title")}</p>
      <p className="mb-4">{t("closingDate.message.text1")}</p>
      <div className="flex gap-2 ">
        <div className="w-1/2 border-1 border-gray-300 relative">
          <LanguageLabel id="form-introduction-english-language" lang={"en"}>
            <>English</>
          </LanguageLabel>
          <Editor
            lang="en"
            content={closedDetails && closedDetails.messageEn ? closedDetails.messageEn : ""}
            onChange={(value: string) => {
              setClosedDetails({ ...closedDetails, messageEn: value });
            }}
          />
        </div>
        {/* @todo add en / fr tag to editor */}
        <div className="w-1/2 border-1 border-gray-300 relative">
          <LanguageLabel id="form-introduction-english-language" lang={"fr"}>
            <>French</>
          </LanguageLabel>
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
