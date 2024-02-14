"use client";
import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { BackArrowIcon, ForwardArrowIcon, StartIcon } from "@clientComponents/icons";
import { useTranslation } from "@i18n/client";

export const Pagination = ({
  lastEvaluatedKey,
  formId,
  responseDownloadLimit,
  recordCount,
}: {
  lastEvaluatedKey: Record<string, string> | null | undefined;
  formId: string;
  responseDownloadLimit: number;
  recordCount: number;
}) => {
  const {
    t,
    i18n: { language },
  } = useTranslation("form-builder-responses");
  const router = useRouter();
  const searchParams = useSearchParams();

  const { statusFilter } = useParams();

  // Extract responseId from lastEvaluatedKey object
  const lastEvaluatedResponseId = lastEvaluatedKey
    ? lastEvaluatedKey.NAME_OR_CONF.split("#")[1]
    : "end"; // If lastEvaluatedKey is null, we're on the last page

  // Keep track of the last evaluated key for each of our pages.
  // The first item in the array is always "start" and the last item is always "end"
  const [keys, setKeys] = React.useState<string[]>(["start"]);

  // Update our keys state when the query param changes
  useEffect(() => {
    try {
      // Get the "page" keys as base64 encoded string from url
      const queryKeys = searchParams.get("keys");

      // Use atob to decode the base64 encoded keys or we're at the "start"
      const decodedKeys = queryKeys ? String(atob(String(queryKeys))).split(",") : ["start"];

      setKeys(decodedKeys);
    } catch (e) {
      // If the base64 encoded string has been tampered with, redirect to the first page
      router.push(
        `/${language}/form-builder/${formId}/responses/${
          statusFilter ? `/${statusFilter}` : "/new"
        }`
      );
    }
  }, [formId, router, searchParams, statusFilter, language]);

  // When going back, we pop the last item off the keys array
  const previousKeys = keys.slice(0, -1);

  // When going back, we need the lastEvaluatedResponseId of the previous page
  const previousLastEvaluatedResponseId = keys[keys.indexOf(lastEvaluatedResponseId) - 2];

  // Used to determine "start" and "end" for the current page
  const currentPageNumber = keys.indexOf(lastEvaluatedResponseId);

  // If we're going back to the first page, just load the base url in case there are newer responses waiting
  let previousLink = "";
  if (previousLastEvaluatedResponseId !== "start") {
    previousLink = `?keys=${btoa(
      previousKeys.join(",")
    )}&lastKey=${previousLastEvaluatedResponseId}`;
  }

  // Only append the lastEvaluatedResponseId to the keys array if it's not already there
  if (!keys.includes(lastEvaluatedResponseId)) {
    setKeys([...keys, lastEvaluatedResponseId]);
  }

  // lastEvaluatedKey is null when we're on the last page
  const isLastPage = lastEvaluatedKey === null;

  // previousLastEvaluatedResponseId is undefined when we're on the first page
  const isFirstPage = previousLastEvaluatedResponseId === undefined;

  // Calculate the start and end of the current page
  const start = responseDownloadLimit * (currentPageNumber - 1) + 1;
  const end = currentPageNumber * responseDownloadLimit - (responseDownloadLimit - recordCount);

  return (
    <>
      <Link
        href={`/${language}/form-builder/responses/${formId}${
          statusFilter ? `/${statusFilter}` : "/new"
        }`}
        legacyBehavior
      >
        <a
          href={`/${language}/form-builder/responses/${formId}${
            statusFilter ? `/${statusFilter}` : "/new"
          }`}
          className={`group mr-4 inline-block ${
            isFirstPage ? "pointer-events-none opacity-50" : ""
          }`}
          aria-disabled={isFirstPage}
        >
          <StartIcon className="inline-block h-6 w-6 group-focus:fill-white" />
          {t("downloadResponsesTable.header.pagination.start")}
        </a>
      </Link>

      <div className="float-right inline-block">
        <Link
          href={`/${language}/form-builder/responses/${formId}${
            statusFilter ? `/${statusFilter}` : "/new"
          }${previousLink}`}
          legacyBehavior
        >
          <a
            href={`/${language}/form-builder/responses/${formId}${
              statusFilter ? `/${statusFilter}` : "/new"
            }${previousLink}`}
            className={`group mr-4 inline-block ${
              isFirstPage ? "pointer-events-none opacity-50" : ""
            }`}
            aria-disabled={isFirstPage}
          >
            <BackArrowIcon className="inline-block h-6 w-6 group-focus:fill-white" />
            {t("downloadResponsesTable.header.pagination.previous")}
          </a>
        </Link>
        {t("downloadResponsesTable.header.pagination.showing", { start, end })}
        <Link
          href={`/${language}/form-builder/responses/${formId}${
            statusFilter ? `/${statusFilter}` : "/new"
          }?keys=${btoa(keys.join(","))}&lastKey=${lastEvaluatedResponseId}`}
          legacyBehavior
        >
          <a
            href={`/${language}/form-builder/responses/${formId}${
              statusFilter ? `/${statusFilter}` : "/new"
            }?keys=${btoa(keys.join(","))}&lastKey=${lastEvaluatedResponseId}`}
            className={`group ml-4 inline-block ${
              isLastPage ? "pointer-events-none opacity-50" : ""
            }`}
            aria-disabled={isLastPage}
          >
            {t("downloadResponsesTable.header.pagination.next")}
            <ForwardArrowIcon className="inline-block h-6 w-6 group-focus:fill-white" />
          </a>
        </Link>
      </div>
    </>
  );
};
