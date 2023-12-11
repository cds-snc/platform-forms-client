import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

export const Pagination = ({
  lastEvaluatedKey,
  formId,
}: {
  lastEvaluatedKey: Record<string, any> | null | undefined;
  formId: string;
}) => {
  const router = useRouter();

  // Extract responseId from lastEvaluatedKey object
  const lastEvaluatedResponseId = lastEvaluatedKey
    ? lastEvaluatedKey.NAME_OR_CONF.split("#")[1]
    : "end"; // If lastEvaluatedKey is null, we're on the last page

  // Need statusQuery when building up the prev/next links
  let statusQuery;
  if (router.query.params) {
    [, statusQuery] = router.query.params;
  }

  // Keep track of the start point for each of our pages.
  // To help when determining whether we're at the beginning or end,
  // the first item in the array is always "start" and the last item is always "end"
  const [pages, setPages] = React.useState<string[]>(["start"]);

  // Update our pages state when the query changes
  useEffect(() => {
    setPages(router.query.pages ? String(router.query.pages).split(",") : ["start"]);
  }, [router.query.pages]);

  // When going back, we pop the last item off the pages array
  const previousPages = pages.slice(0, -1);

  // When going back, we need the lastEvaluatedResponseId of the previous page
  const previousLastEvaluatedResponseId = pages[pages.indexOf(lastEvaluatedResponseId) - 2];

  // If we're going back to the first page, just load the base url in case there are newer responses waiting
  let previousLink = "";
  if (previousLastEvaluatedResponseId !== "start") {
    previousLink = `?pages=${previousPages.join(",")}&lastKey=${previousLastEvaluatedResponseId}`;
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
      {showPrevious && (
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
            className="mr-4 inline-block"
          >
            Previous Page
          </a>
        </Link>
      )}
      {showNext && (
        <Link
          href={`/form-builder/responses/${formId}${
            statusQuery ? "/" + statusQuery : ""
          }?pages=${pages.join(",")}&lastKey=${lastEvaluatedResponseId}`}
          legacyBehavior
        >
          <a
            href={`/form-builder/responses/${formId}${
              statusQuery ? "/" + statusQuery : ""
            }?pages=${pages.join(",")}&lastKey=${lastEvaluatedResponseId}`}
            className="ml-4 inline-block"
          >
            Next Page
          </a>
        </Link>
      )}
    </>
  );
};
