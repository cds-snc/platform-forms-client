"use client";

import { useRouter } from "next/navigation";

import { LinkButton } from "@serverComponents/globals/Buttons/LinkButton";
import { useResponsesContext } from "./context/ResponsesContext";

export const Start = ({ locale, id }: { locale: string; id: string }) => {
  const router = useRouter();

  const { isCompatible } = useResponsesContext();

  if (!isCompatible) {
    router.push(`/${locale}/form-builder/${id}/responses-beta/not-supported`);
    return null;
  }

  return (
    <div>
      <h2 className="">Get new responses</h2>

      <p className="py-4">Download responses in three steps.</p>
      <ol>
        <li>
          <strong>Start with your Forms API Key.</strong> This is how you will access new responses.
        </li>
        <li>
          <strong>Choose download location.</strong> Downloading to the same location will append to
          an existing CSV.
        </li>
        <li>
          <strong>Select response format.</strong> Select HTML individual files or CSV download. All
          responses will come with the raw JSON file.
        </li>
      </ol>
      <p className="py-4">After the inital download, you can select more formats to download.</p>

      <LinkButton.Primary href={`/${locale}/form-builder/${id}/responses-beta/load-key`}>
        Next
      </LinkButton.Primary>
    </div>
  );
};
