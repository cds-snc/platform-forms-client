import React from "react";
import useSWR from "swr";
import { useTranslation } from "next-i18next";
import Image from "next/image";
import Link from "next/link";

import Loader from "@components/globals/Loader";
import { Button } from "./Button";
import { useDialogRef, Dialog } from "./Dialog";
import { DownloadFileButton } from "./DownloadFileButton";
import { themes } from "../shared/Button";
import { Attention, AttentionTypes } from "@components/globals/Attention/Attention";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (res.status === 405) {
    // handle this status code with unprocessed
    return { error: "unprocessed" };
  }

  if (res.status === 200) {
    return { ...(await res.json()), error: "" };
  }

  // handle using swr error
  throw new Error("Something went wrong");
};

export const ConfirmFormDeleteDialog = ({
  formId,
  handleConfirm,
  handleClose,
  isPublished,
}: {
  formId: string;
  handleConfirm: () => void;
  handleClose: () => void;
  isPublished?: boolean;
}) => {
  const dialog = useDialogRef();
  const { t, i18n } = useTranslation("form-builder");
  const { data, isLoading, error } = useSWR(`/api/id/${formId}/submission/unprocessed`, fetcher);

  if (isLoading) {
    return (
      <Dialog handleClose={handleClose} dialogRef={dialog}>
        <div className="p-5">
          <Loader message={t("loading", { ns: "form-builder" })} />{" "}
        </div>
      </Dialog>
    );
  }

  if (error) {
    return (
      <Dialog handleClose={handleClose} dialogRef={dialog}>
        <div className="p-5 min-h-[150px] flex">
          <div className="p-10 w-[100%]">
            <Attention
              type={AttentionTypes.ERROR}
              isAlert={true}
              heading={t("formDelete.error")}
              classes="w-[100%]"
            >
              <p className="text-[#26374a] text-sm">{t("somethingWentWrong")}</p>
            </Attention>
          </div>
        </div>
      </Dialog>
    );
  }

  const actions = (
    <>
      <DownloadFileButton showInfo={false} buttonText={t("formDelete.downloadButtonText")} />
      <Button
        className="ml-5"
        theme="destructive"
        onClick={() => {
          dialog.current?.close();
          handleClose();
          handleConfirm();
        }}
        dataTestId="confirm-delete"
      >
        {t("formDelete.okay")}
      </Button>
    </>
  );

  const responsesLink = `/${i18n.language}/form-builder/responses/${formId}`;

  if (data && data.error === "unprocessed") {
    return (
      <Dialog handleClose={handleClose} dialogRef={dialog}>
        <div className="p-5">
          <div className="px-10 flex justify-center">
            <Image
              width={"326"}
              height={"228"}
              alt=""
              className="block center"
              src="/img/form-builder-download-responses.png"
            />
          </div>
          <div className="mt-10">
            <h2>{t("formDeleteResponses.title")}</h2>
            <p className="mb-6">{t("formDeleteResponses.message1")}</p>
            <p className="mb-2">
              <span className="font-bold">{t("formDeleteResponses.message2")}</span>
            </p>
            <p className="mb-1">{t("formDeleteResponses.message3")}</p>
            <p className="mb-6">{t("formDeleteResponses.message4")}</p>
            <Link href={responsesLink} legacyBehavior>
              <a
                href={responsesLink}
                className={`${themes.primary} ${themes.base} ${themes.htmlLink} mr-4`}
              >
                {t("formDeleteResponses.cta")}
              </a>
            </Link>
          </div>
        </div>
      </Dialog>
    );
  }

  return (
    <Dialog handleClose={handleClose} dialogRef={dialog} actions={actions}>
      <div className="p-5">
        <div className="px-10 flex justify-center">
          <Image
            width={"288"}
            height={"206"}
            alt=""
            className="block center"
            src="/img/form-builder-delete-dialog.svg"
          />
        </div>
        <div className="mt-10">
          <h2>{t("formDelete.title")}</h2>
          {isPublished ? (
            <>
              <p className="mb-6">{t("formDelete.published.message1")}</p>
              <p>
                {t("formDelete.published.message2")}{" "}
                <span className="font-bold">{t("formDelete.published.message3")}</span>
              </p>
            </>
          ) : (
            <>
              <p className="mb-6">{t("formDelete.draft.message1")}</p>
              <p>{t("formDelete.draft.message2")}</p>
            </>
          )}
        </div>
      </div>
    </Dialog>
  );
};
