import React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { DeleteIcon, DownloadIcon, MoreIcon } from "@components/form-builder/icons";
import axios from "axios";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { NextRouter } from "next/router";
import { logMessage } from "@lib/logger";

export const MoreMenu = ({
  formId,
  responseId,
  router,
  errors,
  setErrors,
}: {
  formId: string;
  responseId: string;
  router: NextRouter;
  errors: {
    downloadError: boolean;
    maxItemsError: boolean;
    noItemsError: boolean;
  };
  setErrors: React.Dispatch<
    React.SetStateAction<{
      downloadError: boolean;
      maxItemsError: boolean;
      noItemsError: boolean;
    }>
  >;
}) => {
  const { t } = useTranslation("form-builder-responses");

  const handleDownload = () => {
    const url = `/api/id/${formId}/submissions/download?format=html`;

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
          router.replace(router.asPath, undefined, { scroll: false });
          toast.success(t("downloadResponsesTable.notifications.downloadComplete"));
        }, interval);
      })
      .catch((err) => {
        logMessage.error(err as Error);
        setErrors({ ...errors, downloadError: true });
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
              Download
            </DropdownMenu.Item>
            <DropdownMenu.Item
              onClick={handleDelete}
              className="flex cursor-pointer items-center rounded-md pr-4 text-sm outline-none hover:bg-gray-600 hover:text-white-default focus:bg-gray-600 focus:text-white-default [&_svg]:hover:fill-white [&_svg]:focus:fill-white"
            >
              <DeleteIcon className="scale-50" />
              Delete
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </>
  );
};
