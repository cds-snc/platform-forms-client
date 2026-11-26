import { ResponseHtml } from "@root/lib/responseDownloadFormats/html/components/ResponseHtml";
import type { FileSystemDirectoryHandle } from "native-file-system-adapter";
import { FormProperties, FormRecord, SecurityAttribute, Response } from "@root/lib/types";
import { TFunction } from "i18next";
import { Submission } from "@root/lib/responseDownloadFormats/types";
import {
  formHasGroups,
  sortByGroups,
  sortByLayout,
  mapAnswers,
  type ResponseFilenameMapping,
} from "@gcforms/core";

const orderAnswersByTemplate = (
  mappedAnswers: ReturnType<typeof mapAnswers>,
  formTemplate: FormProperties
) => {
  const elements = Array.isArray(formTemplate.elements) ? formTemplate.elements : [];
  const sortedElements = formHasGroups(formTemplate)
    ? sortByGroups({ form: formTemplate, elements })
    : sortByLayout({
        layout: Array.isArray(formTemplate.layout) ? formTemplate.layout : [],
        elements,
      });
  const answersByQuestionId = new Map(
    mappedAnswers
      .filter((answer) => answer.type !== "-")
      .map((answer) => [answer.questionId, answer])
  );
  const orderedAnswers = sortedElements.flatMap((element) => {
    const answer = answersByQuestionId.get(element.id);
    return answer ? [answer] : [];
  });
  const orderedAnswerSet = new Set(orderedAnswers);

  return [...orderedAnswers, ...mappedAnswers.filter((answer) => !orderedAnswerSet.has(answer))];
};

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

export const writeHtml = async ({
  htmlDirectoryHandle,
  formTemplate,
  submission,
  attachments,
  formId,
  versionNumber,
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
  versionNumber?: number | null;
  t: TFunction<string | string[], undefined>;
}) => {
  const renderToStaticMarkup = (await import("react-dom/server")).renderToStaticMarkup;

  const mappedAnswers = orderAnswersByTemplate(
    mapAnswers({
      formTemplate,
      rawAnswers: submission.rawAnswers,
      attachments,
    }),
    formTemplate
  );

  const submissionObj = {
    id: submission.submissionId,
    createdAt: Date.parse(submission.createdAt),
    confirmationCode: "",
    answers: mappedAnswers,
  } as Submission;

  const securityAttribute = getSecurityAttribute(formTemplate);

  /**
   * NOTE: Creating a fake FormRecord object for rendering the HTML response
   * We do this because the templates API only returns the template itself.
   * ResponseHtml wants a full FormRecord but doesn't use all of its
   * properties so we force isPublished to true even though it
   * might not reflect the actual state of the form.
   */
  const formRecord: FormRecord = {
    id: formId,
    name: String((formTemplate as { name?: string }).name ?? formTemplate.titleEn ?? ""),
    form: formTemplate,
    isPublished: true,
    securityAttribute,
    versionNumber,
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
