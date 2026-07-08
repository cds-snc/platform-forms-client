import { ResponseHtml } from "@root/lib/responseDownloadFormats/html/components/ResponseHtml";
import type { FileSystemDirectoryHandle } from "native-file-system-adapter";
import { mapAnswers } from "@root/lib/responses/mapper/mapAnswers";
import { FormProperties, FormRecord, SecurityAttribute, Response } from "@root/lib/types";
import { TFunction } from "i18next";
import { Submission } from "@root/lib/responseDownloadFormats/types";
import { ResponseFilenameMapping } from "./processResponse";

const getSecurityAttribute = (formTemplate: FormProperties): SecurityAttribute => {
  const securityAttribute = (formTemplate as { securityAttribute?: unknown }).securityAttribute;

  if (
    securityAttribute === "Unclassified" ||
    securityAttribute === "Protected A" ||
    securityAttribute === "Protected B"
  ) {
    return securityAttribute;
  }

  return "Unclassified";
};

const getVersionNumber = (formTemplate: FormProperties): number | null => {
  const versionNumber = (formTemplate as { versionNumber?: unknown }).versionNumber;

  if (typeof versionNumber === "number" && Number.isFinite(versionNumber)) {
    return versionNumber;
  }

  if (typeof versionNumber === "string" && versionNumber.trim() !== "") {
    const parsedVersion = Number(versionNumber);

    if (Number.isFinite(parsedVersion)) {
      return parsedVersion;
    }
  }

  return null;
};

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

  const securityAttribute = getSecurityAttribute(formTemplate);

  const formRecord: FormRecord = {
    id: formId,
    name: String((formTemplate as { name?: string }).name ?? formTemplate.titleEn ?? ""),
    form: formTemplate,
    isPublished: Boolean(formTemplate.isPublished),
    securityAttribute,
    versionNumber: getVersionNumber(formTemplate),
  };

  const html = renderToStaticMarkup(
    ResponseHtml({
      response: submissionObj,
      formRecord,
      confirmationCode: "",
      responseID: submissionObj.id,
      createdAt: submissionObj.createdAt,
      securityAttribute: formRecord.securityAttribute,
      showCodes: false,
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
