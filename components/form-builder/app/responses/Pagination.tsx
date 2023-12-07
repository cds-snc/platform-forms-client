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
  const lastEvaluatedResponseId = lastEvaluatedKey
    ? lastEvaluatedKey.NAME_OR_CONF.split("#")[1]
    : null;

  const router = useRouter();

  const isFirstPage = !router.query.lastEvaluatedKey;

  const showNext = !(router.query.scanForward === "false" && lastEvaluatedKey === null);
  const showPrevious = !(
    (router.query.scanForward === "true" && lastEvaluatedKey === null) ||
    isFirstPage
  );

  return (
    <>
      {showPrevious && (
        <Link
          href={`/form-builder/responses/${formId}?lastEvaluatedKey=${lastEvaluatedResponseId}&scanForward=true`}
          legacyBehavior
        >
          <a
            href={`/form-builder/responses/${formId}?lastEvaluatedKey=${lastEvaluatedResponseId}&scanForward=true`}
            className="mr-4 inline-block"
          >
            Previous Page
          </a>
        </Link>
      )}
      {showNext && (
        <Link
          href={`/form-builder/responses/${formId}?lastEvaluatedKey=${lastEvaluatedResponseId}&scanForward=false`}
          legacyBehavior
        >
          <a
            href={`/form-builder/responses/${formId}?lastEvaluatedKey=${lastEvaluatedResponseId}&scanForward=false`}
            className="ml-4 inline-block"
          >
            Next Page
          </a>
        </Link>
      )}
    </>
  );
};
