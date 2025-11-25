import { ResponseHtml } from "@root/lib/responseDownloadFormats/html/components/ResponseHtml";
import type { FileSystemDirectoryHandle } from "native-file-system-adapter";
import { mapAnswers } from "@root/lib/responses/mapper/mapAnswers";
import { FormProperties, SecurityAttribute, Response } from "@root/lib/types";
import { TFunction } from "i18next";
import { Submission } from "@root/lib/responseDownloadFormats/types";
import { ResponseFilenameMapping } from "./processResponse";

export const writeHtml = async ({
  htmlDirectoryHandle,
  formTemplate,
  submission,
  attachments,
  formId,
  t,
}: {
  htmlDirectoryHandle: FileSystemDirectoryHandle;
  formTemplate: FormProperties;
  submission: {
    submissionId: string;
    createdAt: string;
    rawAnswers: Record<string, Response>;
  };
  attachments?: ResponseFilenameMapping;
  formId: string;
  t: TFunction<string | string[], undefined>;
}) => {
  const renderToStaticMarkup = (await import("react-dom/server")).renderToStaticMarkup;

  const mappedAnswers = mapAnswers({
    formTemplate,
    rawAnswers: submission.rawAnswers,
    attachments,
  });

  const submissionObj = {
    id: submission.submissionId,
    createdAt: Date.parse(submission.createdAt),
    confirmationCode: "",
    answers: mappedAnswers,
  } as Submission;

  // Ensure securityAttribute is of type SecurityAttribute
  const securityAttribute: SecurityAttribute =
    typeof formTemplate.securityAttribute === "string"
      ? (formTemplate.securityAttribute as SecurityAttribute)
      : "Unclassified";

  const formRecord = {
    id: formId,
    name: String(formTemplate.name ?? ""),
    form: formTemplate,
    isPublished: Boolean(formTemplate.isPublished),
    securityAttribute,
  };

  const html = renderToStaticMarkup(
    ResponseHtml({
      response: submissionObj,
      formRecord,
      confirmationCode: "",
      responseID: submissionObj.id,
      createdAt: submissionObj.createdAt,
      securityAttribute: "Unclassified",
      showCodes: false,
      linkAttachments: true,
      t,
    })
  );

  const htmlFileHandle = await htmlDirectoryHandle.getFileHandle(`${submissionObj.id}.html`, {
    create: true,
  });
  const writable = await htmlFileHandle.createWritable();
  await writable.write(html);
  await writable.close();
};
