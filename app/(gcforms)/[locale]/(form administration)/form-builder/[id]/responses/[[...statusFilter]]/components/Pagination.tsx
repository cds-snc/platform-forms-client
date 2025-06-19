"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { BackArrowIcon, ForwardArrowIcon, StartIcon } from "@serverComponents/icons";
import { useTranslation } from "@i18n/client";
import { StartFromExclusiveResponse } from "@lib/types";

const decodeBase64Url = (base64Url: string) => {
  const pureBase64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  return atob(pureBase64);
};

const encodeBase64Url = (payload: string) => {
  return btoa(payload).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
};

export const Pagination = ({
  startFromExclusiveResponse,
  formId,
  responseDownloadLimit,
  recordCount,
}: {
  startFromExclusiveResponse: StartFromExclusiveResponse | null;
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
  const { statusFilter } = useParams<{ statusFilter: string }>();
  const queryKeys = searchParams.get("keys");
  const lastEvaluatedResponse = startFromExclusiveResponse
    ? `${startFromExclusiveResponse.name}_${startFromExclusiveResponse.createdAt}`
    : "end"; // If startFromExclusiveResponse is null, we're on the last page

  const [keys, setKeys] = useState<string[]>(["start", lastEvaluatedResponse]);

  // Update our keys state when the query param changes
  useEffect(() => {
    if (queryKeys) {
      try {
        const decodedQueryKeys = decodeBase64Url(queryKeys).split(",");

        // If current lastEvaluatedResponse is not in the keys array, append it
        if (!decodedQueryKeys.includes(lastEvaluatedResponse)) {
          decodedQueryKeys.push(lastEvaluatedResponse);
        }

        setKeys(decodedQueryKeys);
      } catch (e) {
        // If the base64 encoded string has been tampered with, redirect to the first page
        router.push(
          `/${language}/form-builder/${formId}/responses/${statusFilter ? `/${statusFilter}` : "/"}`
        );
      }
    }
  }, [formId, language, lastEvaluatedResponse, queryKeys, router, statusFilter]);

  // When going back, we pop the last item off the keys array
  const previousKeys = keys.slice(0, -1);

  // When going back, we need the lastEvaluatedResponse of the previous page
  const previousLastEvaluatedResponse = keys[keys.indexOf(lastEvaluatedResponse) - 2];

  // Used to determine "start" and "end" for the current page
  const currentPageNumber = keys.indexOf(lastEvaluatedResponse);

  // If we're going back to the first page, just load the base url in case there are newer responses waiting
  let previousLink = "";
  if (previousLastEvaluatedResponse !== "start") {
    previousLink = `?keys=${encodeBase64Url(
      previousKeys.join(",")
    )}&lastKey=${previousLastEvaluatedResponse}`;
  }

  // startFromExclusiveResponse is null when we're on the last page
  const isLastPage = startFromExclusiveResponse === null;

  // previousLastEvaluatedResponse is undefined when we're on the first page
  const isFirstPage = previousLastEvaluatedResponse === undefined;

  // Calculate the start and end of the current page
  const start = responseDownloadLimit * (currentPageNumber - 1) + 1;
  const end = currentPageNumber * responseDownloadLimit - (responseDownloadLimit - recordCount);

  return (
    <div>
      <Link
        href={`/${language}/form-builder/${formId}/responses${
          statusFilter ? `/${statusFilter}` : "/"
        }`}
        className={`group mr-4 inline-block ${isFirstPage ? "pointer-events-none opacity-50" : ""}`}
        aria-disabled={isFirstPage}
      >
        <StartIcon className="inline-block size-6 group-focus:fill-white" />
        {t("downloadResponsesTable.header.pagination.start")}
      </Link>

      <div className="float-right inline-block">
        <Link
          href={`/${language}/form-builder/${formId}/responses${
            statusFilter ? `/${statusFilter}` : "/"
          }${previousLink}`}
          className={`group mr-4 inline-block ${
            isFirstPage ? "pointer-events-none opacity-50" : ""
          }`}
          aria-disabled={isFirstPage}
        >
          <>
            <BackArrowIcon className="inline-block size-6 " />
            {t("downloadResponsesTable.header.pagination.previous")}
          </>
        </Link>
        {t("downloadResponsesTable.header.pagination.showing", { start, end })}
        <Link
          href={`/${language}/form-builder/${formId}/responses${
            statusFilter ? `/${statusFilter}` : "/"
          }?keys=${encodeBase64Url(keys.join(","))}&lastKey=${lastEvaluatedResponse}`}
          className={`group ml-4 inline-block ${
            isLastPage ? "pointer-events-none opacity-50" : ""
          }`}
          aria-disabled={isLastPage}
        >
          <>
            {t("downloadResponsesTable.header.pagination.next")}
            <ForwardArrowIcon className="inline-block size-6" />
          </>
        </Link>
      </div>
    </div>
  );
};
