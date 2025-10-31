import Image from "next/image";
import { useResponsesContext } from "../context/ResponsesContext";
import { useTranslation } from "@i18n/client";

export const Responses = () => {
  const { newFormSubmissions } = useResponsesContext();
  const { t } = useTranslation("response-api");

  return newFormSubmissions && newFormSubmissions.length > 0 ? (
    <div>
      <h2>{t("loadKeyPage.newResponsesAvailable")}</h2>
      <div>
        <Image
          src="/img/new-responses.svg"
          alt={t("loadKeyPage.newResponsesAvailable")}
          width={218}
          height={196}
        />
      </div>
    </div>
  ) : (
    <div>
      <h2>{t("loadKeyPage.noNewResponsesAvailable")}</h2>
      <div>
        <Image
          src="/img/no-responses.svg"
          alt={t("loadKeyPage.noNewResponsesAvailable")}
          width={218}
          height={196}
        />
      </div>
    </div>
  );
};
