import React from "react";
import { Card, HeadingLevel } from "@clientComponents/globals/card/Card";
import Image from "next/image";
import { VaultStatus } from "@lib/types";
import { useTranslation } from "react-i18next";

export const NoResponses = ({ statusFilter }: { statusFilter: string }) => {
  const { t } = useTranslation("form-builder-responses");

  return (
    <>
      {statusFilter === VaultStatus.NEW && (
        <>
          <Card
            icon={<Image src="/img/mailbox.svg" alt="" width="200" height="200" />}
            title={t("downloadResponsesTable.card.noNewResponses")}
            content={t("downloadResponsesTable.card.noNewResponsesMessage")}
            headingTag={HeadingLevel.H1}
            headingStyle="gc-h2 text-[#748094]"
          />
        </>
      )}
      {statusFilter === VaultStatus.DOWNLOADED && (
        <>
          <Card
            icon={<Image src="/img/mailbox.svg" alt="" width="200" height="200" />}
            title={t("downloadResponsesTable.card.noDownloadedResponses")}
            content={t("downloadResponsesTable.card.noDownloadedResponsesMessage")}
            headingTag={HeadingLevel.H1}
            headingStyle="gc-h2 text-[#748094]"
          />
        </>
      )}
      {statusFilter === VaultStatus.CONFIRMED && (
        <>
          <Card
            icon={<Image src="/img/mailbox.svg" alt="" width="200" height="200" />}
            title={t("downloadResponsesTable.card.noDeletedResponses")}
            content={t("downloadResponsesTable.card.noDeletedResponsesMessage")}
            headingTag={HeadingLevel.H1}
            headingStyle="gc-h2 text-[#748094]"
          />
        </>
      )}
      {statusFilter === VaultStatus.PROBLEM && (
        <>
          <h1 className="visually-hidden">{t("tabs.problemResponses.title")}</h1>
          <Card
            icon={<Image src="/img/mailbox.svg" alt="" width="200" height="200" />}
            title={t("downloadResponsesTable.card.noProblemResponses")}
            content={t("downloadResponsesTable.card.noProblemResponsesMessage")}
          />
        </>
      )}
    </>
  );
};
