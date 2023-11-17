import React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { DeleteIcon, DownloadIcon, MoreIcon } from "@components/form-builder/icons";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { logMessage } from "@lib/logger";
import { useRouter } from "next/router";

export const MoreMenu = ({
  formId,
  responseId,
  setDownloadError,
  onDownloadSuccess,
}: {
  formId: string;
  responseId: string;
  setDownloadError: (downloadError: boolean) => void;
  onDownloadSuccess: () => void;
}) => {
  const { t } = useTranslation("form-builder-responses");

  const router = useRouter();
  const [, statusQuery = "new"] = router.query?.params || [];

  const handleDownload = () => {
    const url = `/api/id/${formId}/submission/download?format=html`;

    axios({
      url,
      method: "POST",
      data: {
        ids: responseId,
      },
    })
      .then((response) => {
        const interval = 200;
        const submission = response.data[0];
        const fileName = `${submission.id}.html`;
        const href = window.URL.createObjectURL(new Blob([submission.html]));
        const anchorElement = document.createElement("a");
        anchorElement.href = href;
        anchorElement.download = fileName;
        document.body.appendChild(anchorElement);
        anchorElement.click();
        document.body.removeChild(anchorElement);
        window.URL.revokeObjectURL(href);

        setTimeout(() => {
          onDownloadSuccess();
        }, interval);
      })
      .catch((err) => {
        logMessage.error(err as Error);
        setDownloadError(true);
      });
  };

  const handleDelete = () => {
    alert("Not implemented yet");
  };

  return (
    <>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <MoreIcon className="h-10 w-10" />
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            side="right"
            sideOffset={15}
            align="start"
            className="rounded-lg border-1 border-black bg-white px-1.5 py-1 shadow-md"
          >
            <DropdownMenu.Item
              onClick={handleDownload}
              className="flex cursor-pointer items-center rounded-md pr-4 text-sm outline-none hover:bg-gray-600 hover:text-white-default focus:bg-gray-600 focus:text-white-default [&_svg]:hover:fill-white [&_svg]:focus:fill-white"
            >
              <DownloadIcon className="scale-50" />
              {t("downloadResponsesTable.download")}
            </DropdownMenu.Item>
            {statusQuery === "new" && (
              <DropdownMenu.Item
                onClick={handleDelete}
                className="flex cursor-pointer items-center rounded-md pr-4 text-sm outline-none hover:bg-gray-600 hover:text-white-default focus:bg-gray-600 focus:text-white-default [&_svg]:hover:fill-white [&_svg]:focus:fill-white"
              >
                <DeleteIcon className="scale-50" />
                {t("downloadResponsesTable.delete")}
              </DropdownMenu.Item>
            )}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </>
  );
};
