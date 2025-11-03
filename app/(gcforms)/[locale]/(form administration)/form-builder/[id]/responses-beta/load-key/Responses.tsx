import Image from "next/image";
import { useResponsesContext } from "../context/ResponsesContext";
import { useTranslation } from "@i18n/client";

import Skeleton from "react-loading-skeleton";

export const Responses = ({ hasCheckedForResponses }: { hasCheckedForResponses: boolean }) => {
  const { newFormSubmissions } = useResponsesContext();
  const { t } = useTranslation("response-api");

  if (!hasCheckedForResponses) {
    return (
      <>
        <Skeleton count={1} className="h-[40px]" />{" "}
        <Skeleton count={1} className="h-[200px] w-[250px]" />
      </>
    );
  }

  return newFormSubmissions && newFormSubmissions.length > 0 ? (
    <div>
      <h2>{t("loadKeyPage.newResponsesAvailable")}</h2>
      <div>
        <Image
          src="/img/api-new-responses.svg"
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
          src="/img/api-no-responses.svg"
          alt={t("loadKeyPage.noNewResponsesAvailable")}
          width={218}
          height={196}
        />
      </div>
    </div>
  );
};
