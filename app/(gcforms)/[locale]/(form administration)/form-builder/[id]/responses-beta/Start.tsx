"use client";

import { LinkButton } from "@root/components/serverComponents/globals/Buttons/LinkButton";

export const Start = ({ locale, id }: { locale: string; id: string }) => {
  return (
    <div>
      <h1 className="">Get new responses</h1>

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
