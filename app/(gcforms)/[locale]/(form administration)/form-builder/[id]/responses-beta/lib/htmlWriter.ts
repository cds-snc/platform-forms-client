import { ResponseHtml } from "@root/lib/responseDownloadFormats/html/components/ResponseHtml";
import type { FileSystemDirectoryHandle } from "native-file-system-adapter";
import { mapAnswers } from "@root/lib/responses/mapper/mapAnswers";
import { FormProperties, SecurityAttribute } from "@root/lib/types";
import { TFunction } from "i18next";
import { Submission } from "@root/lib/responseDownloadFormats/types";

export const writeHtml = async ({
  directoryHandle,
  formTemplate,
  submission,
  formId,
  t,
}: {
  directoryHandle: FileSystemDirectoryHandle;
  formTemplate: FormProperties;
  submission: {
    submissionId: string;
    createdAt: string;
    rawAnswers: Record<string, Response>;
  };
  formId: string;
  t: TFunction<string | string[], undefined>;
}) => {
  const htmlDirectoryHandle = await directoryHandle.getDirectoryHandle("html-responses", {
    create: true,
  });

  const renderToStaticMarkup = (await import("react-dom/server")).renderToStaticMarkup;

  const mappedAnswers = mapAnswers({
    formTemplate,
    rawAnswers: submission.rawAnswers,
  });

  const submissionObj = {
    id: submission.submissionId,
    createdAt: Number(submission.createdAt),
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
