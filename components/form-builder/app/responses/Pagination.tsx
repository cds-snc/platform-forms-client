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
  lastEvaluatedKey: Record<string, any> | null | undefined;
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

  // Keep track of the start point for each of our pages.
  // To help when determining whether we're at the beginning or end,
  // the first item in the array is always "start" and the last item is always "end"
  const [pages, setPages] = React.useState<string[]>(["start"]);

  // Update our pages state when the query changes
  useEffect(() => {
    try {
      setPages(
        router.query.pages ? String(atob(String(router.query.pages))).split(",") : ["start"]
      );
    } catch (e) {
      router.push(`/form-builder/responses/${formId}${statusQuery ? "/" + statusQuery : ""}`);
    }
  }, [formId, router, router.query.pages, statusQuery]);

  // When going back, we pop the last item off the pages array
  const previousPages = pages.slice(0, -1);

  // Used to determine start and end points for the current page
  const currentPageNumber = pages.indexOf(lastEvaluatedResponseId);

  // When going back, we need the lastEvaluatedResponseId of the previous page
  const previousLastEvaluatedResponseId = pages[pages.indexOf(lastEvaluatedResponseId) - 2];

  // If we're going back to the first page, just load the base url in case there are newer responses waiting
  let previousLink = "";
  if (previousLastEvaluatedResponseId !== "start") {
    previousLink = `?pages=${btoa(
      previousPages.join(",")
    )}&lastKey=${previousLastEvaluatedResponseId}`;
  }

  // Only append the lastEvaluatedResponseId to the pages array if it's not already there
  if (!pages.includes(lastEvaluatedResponseId)) {
    setPages([...pages, lastEvaluatedResponseId]);
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
          className={`mr-4 inline-block ${!showPrevious ? "pointer-events-none opacity-50" : ""}`}
          aria-disabled={!showPrevious}
        >
          <BackArrowIcon className="inline-block h-6 w-6" />
          {t("downloadResponsesTable.header.pagination.previous")}
        </a>
      </Link>
      {t("downloadResponsesTable.header.pagination.showing", {
        start: responseDownloadLimit * (currentPageNumber - 1) + 1,
        end: currentPageNumber * responseDownloadLimit - (responseDownloadLimit - recordCount),
      })}
      <Link
        href={`/form-builder/responses/${formId}${
          statusQuery ? "/" + statusQuery : ""
        }?pages=${btoa(pages.join(","))}&lastKey=${lastEvaluatedResponseId}`}
        legacyBehavior
      >
        <a
          href={`/form-builder/responses/${formId}${
            statusQuery ? "/" + statusQuery : ""
          }?pages=${btoa(pages.join(","))}&lastKey=${lastEvaluatedResponseId}`}
          className={`ml-4 inline-block ${!showNext ? "pointer-events-none opacity-50" : ""}`}
          aria-disabled={!showNext}
        >
          {t("downloadResponsesTable.header.pagination.next")}
          <ForwardArrowIcon className="inline-block h-6 w-6" />
        </a>
      </Link>
    </>
  );
};
