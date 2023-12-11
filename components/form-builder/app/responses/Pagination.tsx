import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";

export const Pagination = ({
  lastEvaluatedKey,
  formId,
}: {
  lastEvaluatedKey: Record<string, any> | null | undefined;
  formId: string;
}) => {
  // Extract responseId from lastEvaluatedKey object
  const lastEvaluatedResponseId = lastEvaluatedKey
    ? lastEvaluatedKey.NAME_OR_CONF.split("#")[1]
    : "end";

  const router = useRouter();
  let statusQuery;

  if (router.query.params) {
    [, statusQuery] = router.query.params;
  }

  const [pages, setPages] = React.useState<string[]>(
    router.query.pages ? String(router.query.pages).split(",") : ["start"]
  );

  const previousLastEvaluatedResponseId = pages[pages.indexOf(lastEvaluatedResponseId) - 2];

  let previousLink = "";
  if (previousLastEvaluatedResponseId !== "start") {
    previousLink = `?pages=${pages.join(",")}&lastKey=${previousLastEvaluatedResponseId}`;
  }

  if (!pages.includes(lastEvaluatedResponseId)) {
    setPages([...pages, lastEvaluatedResponseId]);
  }

  const showNext = lastEvaluatedKey !== null;
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
