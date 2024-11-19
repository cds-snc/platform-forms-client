import React, { useEffect, useState } from "react";
import { Card, HeadingLevel } from "@clientComponents/globals/card/Card";
import Image from "next/image";
import { VaultStatus } from "@lib/types";
import { useTranslation } from "react-i18next";
import { useFormBuilderConfig } from "@lib/hooks/useFormBuilderConfig";
import { newResponsesExist } from "../actions";

export const NoResponses = ({ statusFilter, formId }: { statusFilter: string; formId: string }) => {
  const { t } = useTranslation("form-builder-responses");
  const { hasApiKeyId } = useFormBuilderConfig();

  const [checkingApiSubmissions, setCheckingApiSubmissions] = useState(true);
  const [hasApiSubmissions, setHasApiSubmissions] = useState(false);

  useEffect(() => {
    const getApiSubmissions = async () => {
      const result = await newResponsesExist(formId);
      if (result === true) {
        setHasApiSubmissions(true);
      }
      setCheckingApiSubmissions(false);
    };
    if (hasApiKeyId) {
      getApiSubmissions();
    }
  }, [hasApiKeyId, formId]);

  return (
    <>
      {!hasApiKeyId && statusFilter === VaultStatus.NEW && (
        <Card
          icon={<Image src="/img/mailbox.svg" alt="" width="200" height="200" />}
          title={t("downloadResponsesTable.card.noNewResponses")}
          content={t("downloadResponsesTable.card.noNewResponsesMessage")}
          headingTag={HeadingLevel.H1}
          headingStyle="gc-h2 text-[#748094]"
        />
      )}
      {!hasApiKeyId && statusFilter === VaultStatus.DOWNLOADED && (
        <Card
          icon={<Image src="/img/mailbox.svg" alt="" width="200" height="200" />}
          title={t("downloadResponsesTable.card.noDownloadedResponses")}
          content={t("downloadResponsesTable.card.noDownloadedResponsesMessage")}
          headingTag={HeadingLevel.H1}
          headingStyle="gc-h2 text-[#748094]"
        />
      )}
      {!hasApiKeyId && statusFilter === VaultStatus.CONFIRMED && (
        <Card
          icon={<Image src="/img/mailbox.svg" alt="" width="200" height="200" />}
          title={t("downloadResponsesTable.card.noDeletedResponses")}
          content={t("downloadResponsesTable.card.noDeletedResponsesMessage")}
          headingTag={HeadingLevel.H1}
          headingStyle="gc-h2 text-[#748094]"
        />
      )}

      {!hasApiKeyId && statusFilter === VaultStatus.PROBLEM && (
        <>
          <h1 className="visually-hidden">{t("tabs.problemResponses.title")}</h1>
          <Card
            icon={<Image src="/img/mailbox.svg" alt="" width="200" height="200" />}
            title={t("downloadResponsesTable.card.noProblemResponses")}
            content={t("downloadResponsesTable.card.noProblemResponsesMessage")}
          />
        </>
      )}

      {/* 
          API user has no responses available
        */}
      {hasApiKeyId && !checkingApiSubmissions && !hasApiSubmissions && (
        <Card
          icon={<Image src="/img/mailbox.svg" alt="" width="200" height="200" />}
          title={t("downloadResponsesTable.card.noNewResponsesApi")}
          content={t("downloadResponsesTable.card.noNewResponsesApiMessage")}
          headingTag={HeadingLevel.H1}
          headingStyle="gc-h2 text-[#748094]"
        />
      )}

      {/* 
          No responses are available for this view 
          but there are submissions available for API retreival 
        */}

      {!checkingApiSubmissions && hasApiKeyId && hasApiSubmissions && (
        <Card
          icon={<Image src="/img/mailbox.svg" alt="" width="200" height="200" />}
          title={t("downloadResponsesTable.card.apiResponsesAvailable")}
          content={t("downloadResponsesTable.card.apiResponsesAvailableMessage")}
          headingTag={HeadingLevel.H1}
          headingStyle="gc-h2 text-[#748094]"
        />
      )}
    </>
  );
};
