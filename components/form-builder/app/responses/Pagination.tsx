import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { BackArrowIcon, ForwardArrowIcon } from "@components/form-builder/icons";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation("form-builder-responses");
  const router = useRouter();

  // Extract responseId from lastEvaluatedKey object
  const lastEvaluatedResponseId = lastEvaluatedKey
    ? lastEvaluatedKey.NAME_OR_CONF.split("#")[1]
    : "end"; // If lastEvaluatedKey is null, we're on the last page

  // Need statusQuery when building up the prev/next links
  let statusQuery: string | undefined;
  if (router.query.params) {
    [, statusQuery] = router.query.params;
  }

  // Keep track of the start point for each of our keys.
  // To help when determining whether we're at the beginning or end,
  // the first item in the array is always "start" and the last item is always "end"
  const [keys, setKeys] = React.useState<string[]>(["start"]);

  // Update our keys state when the query changes
  useEffect(() => {
    try {
      setKeys(router.query.keys ? String(atob(String(router.query.keys))).split(",") : ["start"]);
    } catch (e) {
      router.push(`/form-builder/responses/${formId}${statusQuery ? "/" + statusQuery : ""}`);
    }
  }, [formId, router, router.query.keys, statusQuery]);

  // When going back, we pop the last item off the keys array
  const previousPages = keys.slice(0, -1);

  // Used to determine start and end points for the current page
  const currentPageNumber = keys.indexOf(lastEvaluatedResponseId);

  // When going back, we need the lastEvaluatedResponseId of the previous page
  const previousLastEvaluatedResponseId = keys[keys.indexOf(lastEvaluatedResponseId) - 2];

  // If we're going back to the first page, just load the base url in case there are newer responses waiting
  let previousLink = "";
  if (previousLastEvaluatedResponseId !== "start") {
    previousLink = `?keys=${btoa(
      previousPages.join(",")
    )}&lastKey=${previousLastEvaluatedResponseId}`;
  }

  // Only append the lastEvaluatedResponseId to the keys array if it's not already there
  if (!keys.includes(lastEvaluatedResponseId)) {
    setKeys([...keys, lastEvaluatedResponseId]);
  }

  // lastEvaluatedKey is null when we're on the last page
  const showNext = lastEvaluatedKey !== null;

  // previousLastEvaluatedResponseId is undefined when we're on the first page
  const showPrevious = previousLastEvaluatedResponseId !== undefined;

  return (
    <>
      <Link
        href={`/form-builder/responses/${formId}${
          statusQuery ? "/" + statusQuery : ""
        }${previousLink}`}
        legacyBehavior
      >
        <a
          href={`/form-builder/responses/${formId}${
            statusQuery ? "/" + statusQuery : ""
          }${previousLink}`}
          className={`group mr-4 inline-block ${
            !showPrevious ? "pointer-events-none opacity-50" : ""
          }`}
          aria-disabled={!showPrevious}
        >
          <BackArrowIcon className="inline-block h-6 w-6 group-focus:fill-white" />
          {t("downloadResponsesTable.header.pagination.previous")}
        </a>
      </Link>
      {t("downloadResponsesTable.header.pagination.showing", {
        start: responseDownloadLimit * (currentPageNumber - 1) + 1,
        end: currentPageNumber * responseDownloadLimit - (responseDownloadLimit - recordCount),
      })}
      <Link
        href={`/form-builder/responses/${formId}${statusQuery ? "/" + statusQuery : ""}?keys=${btoa(
          keys.join(",")
        )}&lastKey=${lastEvaluatedResponseId}`}
        legacyBehavior
      >
        <a
          href={`/form-builder/responses/${formId}${
            statusQuery ? "/" + statusQuery : ""
          }?keys=${btoa(keys.join(","))}&lastKey=${lastEvaluatedResponseId}`}
          className={`group ml-4 inline-block ${!showNext ? "pointer-events-none opacity-50" : ""}`}
          aria-disabled={!showNext}
        >
          {t("downloadResponsesTable.header.pagination.next")}
          <ForwardArrowIcon className="inline-block h-6 w-6 group-focus:fill-white" />
        </a>
      </Link>
    </>
  );
};
