import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Card, HeadingLevel, Text } from "@clientComponents/globals/card/Card";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { useFormBuilderConfig } from "@lib/hooks/useFormBuilderConfig";
import { newResponsesExist, unConfirmedResponsesExist } from "../actions";
import { StatusFilter } from "../types";

import { useRouter } from "next/navigation";
import { useFeatureFlags } from "@lib/hooks/useFeatureFlags";
import { FeatureFlags } from "@lib/cache/types";

import { enableResponsesBetaMode } from "../../actions";

export const NoResponses = ({
  statusFilter,
  formId,
}: {
  statusFilter: StatusFilter;
  formId: string;
}) => {
  const router = useRouter();
  const { getFlag } = useFeatureFlags();
  const { t, i18n } = useTranslation(["form-builder-responses"]);
  const { hasApiKeyId } = useFormBuilderConfig();

  const [checkingApiSubmissions, setCheckingApiSubmissions] = useState(true);
  const [hasNewApiSubmissions, setHasNewApiSubmissions] = useState(false);
  const [hasUnconfirmedApiSubmissions, setHasUnconfirmedApiSubmissions] = useState(false);

  const responsesBetaEnabled = getFlag(FeatureFlags.responsesBeta);

  const handleResponsesBetaClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    await enableResponsesBetaMode();
    router.push(`/${i18n.language}/form-builder/${formId}/responses-beta`);
  };

  useEffect(() => {
    const getApiSubmissions = async () => {
      const newApiSubmissions = await newResponsesExist(formId);
      const unconfirmedApiSubmissions = await unConfirmedResponsesExist(formId);

      if (newApiSubmissions === true) {
        setHasNewApiSubmissions(true);
      }
      if (unconfirmedApiSubmissions === true) {
        setHasUnconfirmedApiSubmissions(true);
      }

      setCheckingApiSubmissions(false);
    };
    if (hasApiKeyId) {
      getApiSubmissions();
    }
  }, [hasApiKeyId, formId]);

  return (
    <>
      {!hasApiKeyId && statusFilter === StatusFilter.NEW && (
        <Card
          icon={<Image src="/img/mailbox.svg" alt="" width="200" height="200" />}
          title={t("downloadResponsesTable.card.noNewResponses")}
          content={t("downloadResponsesTable.card.noNewResponsesMessage")}
          headingTag={HeadingLevel.H1}
          headingStyle="gc-h2 text-[#748094]"
        />
      )}
      {!hasApiKeyId && statusFilter === StatusFilter.DOWNLOADED && (
        <Card
          icon={<Image src="/img/mailbox.svg" alt="" width="200" height="200" />}
          title={t("downloadResponsesTable.card.noDownloadedResponses")}
          content={t("downloadResponsesTable.card.noDownloadedResponsesMessage")}
          headingTag={HeadingLevel.H1}
          headingStyle="gc-h2 text-[#748094]"
        />
      )}
      {!hasApiKeyId && statusFilter === StatusFilter.CONFIRMED && (
        <Card
          icon={<Image src="/img/mailbox.svg" alt="" width="200" height="200" />}
          title={t("downloadResponsesTable.card.noDeletedResponses")}
          content={t("downloadResponsesTable.card.noDeletedResponsesMessage")}
          headingTag={HeadingLevel.H1}
          headingStyle="gc-h2 text-[#748094]"
        />
      )}

      {!hasApiKeyId && statusFilter === StatusFilter.PROBLEM && (
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
      {hasApiKeyId &&
        !checkingApiSubmissions &&
        !hasNewApiSubmissions &&
        !hasUnconfirmedApiSubmissions && (
          <Card
            icon={<Image src="/img/butterfly_noresponses.svg" alt="" width="200" height="200" />}
          >
            <div className="max-w-[600px]">
              <h3 className="mb-4 text-slate-500">
                <Text i18nKey="downloadResponsesTable.card.noNewResponsesApiTitle" />
              </h3>
              <Text i18nKey="downloadResponsesTable.card.noNewResponsesApiMessage" />
            </div>
          </Card>
        )}

      {/* 
          No responses are available for this view 
          but there are submissions available for API retreival 
        */}
      {!checkingApiSubmissions && hasApiKeyId && hasNewApiSubmissions && (
        <>
          <Card icon={<Image src="/img/flower_responses.svg" alt="" width="200" height="200" />}>
            <div className="max-w-[600px]">
              <h3 className="mb-4 text-slate-500">
                <Text i18nKey="downloadResponsesTable.card.apiResponsesAvailableTitle" />
              </h3>
              <Text i18nKey="downloadResponsesTable.card.apiResponsesAvailableMessage" />
            </div>
          </Card>

          {responsesBetaEnabled && (
            <div className="mt-4">
              <Link
                onClick={handleResponsesBetaClick}
                data-testid="responses-beta-switch-link"
                href={`/${i18n.language}/form-builder/${formId}/responses-beta`}
                className="text-black visited:text-black"
              >
                {t("responsesBeta.responsesBetaLink")}
              </Link>
            </div>
          )}
        </>
      )}

      {!checkingApiSubmissions &&
        hasApiKeyId &&
        !hasNewApiSubmissions &&
        hasUnconfirmedApiSubmissions && (
          <Card icon={<Image src="/img/flower_responses.svg" alt="" width="200" height="200" />}>
            <div className="max-w-[600px]">
              <h3 className="mb-4 text-slate-500">
                <Text i18nKey="downloadResponsesTable.card.apiResponsesAwaitingConfirmTitle" />
              </h3>
              <Text i18nKey="downloadResponsesTable.card.apiResponsesAwaitingConfirmMessage" />
            </div>
          </Card>
        )}
    </>
  );
};
