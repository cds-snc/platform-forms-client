"use server";
import { Language } from "@clientComponents/form-builder/types";
import { getAppSetting } from "@lib/appSettings";
import { logEvent } from "@lib/auditLogs";
import { auth } from "@lib/auth";
import { ucfirst } from "@lib/client/clientHelpers";
import { AccessControlError, createAbility } from "@lib/privileges";
import {
  Answer,
  DownloadFormat,
  FormResponseSubmissions,
} from "@lib/responseDownloadFormats/types";
import { getFullTemplateByID } from "@lib/templates";
import { FormElementTypes, VaultStatus } from "@lib/types";
import { isResponseId } from "@lib/validation";
import { listAllSubmissions, retrieveSubmissions, updateLastDownloadedBy } from "@lib/vault";
import { transform as csvTransform } from "@lib/responseDownloadFormats/csv";
import { transform as htmlAggregatedTransform } from "@lib/responseDownloadFormats/html-aggregated";
import { transform as htmlTransform } from "@lib/responseDownloadFormats/html";
import { transform as zipTransform } from "@lib/responseDownloadFormats/html-zipped";
import { transform as jsonTransform } from "@lib/responseDownloadFormats/json";
import { cache } from "react";
import { logMessage } from "@lib/logger";

export const fetchTemplate = cache(async (id: string) => {
  const session = await auth();

  if (!session) {
    throw new Error("User is not authenticated");
  }

  const ability = createAbility(session);
  const template = await getFullTemplateByID(ability, id);

  return template;
});

export const fetchSubmissions = async ({
  formId,
  status,
  lastKey,
}: {
  formId: string;
  status: string;
  lastKey?: string;
}) => {
  const session = await auth();

  if (!session) {
    throw new Error("User is not authenticated");
  }

  const ability = createAbility(session);

  // get status from url params (default = new) and capitalize/cast to VaultStatus
  // Protect against invalid status query
  const selectedStatus = Object.values(VaultStatus).includes(ucfirst(status) as VaultStatus)
    ? (ucfirst(status) as VaultStatus)
    : VaultStatus.NEW;

  let currentLastEvaluatedKey = null;

  // build up lastEvaluatedKey from lastKey url param
  if (lastKey && isResponseId(String(lastKey))) {
    currentLastEvaluatedKey = {
      Status: selectedStatus,
      NAME_OR_CONF: `NAME#${lastKey}`,
      FormID: formId,
    };
  }

  const { submissions, lastEvaluatedKey } = await listAllSubmissions(
    ability,
    formId,
    selectedStatus,
    currentLastEvaluatedKey
  );

  return { submissions, lastEvaluatedKey };
};

// /api/id/${formId}/submission/download?format=${selectedFormat}&lang=${i18n.language}`;

const sortByLayout = ({ layout, elements }: { layout: number[]; elements: Answer[] }) => {
  return elements.sort((a, b) => layout.indexOf(a.questionId) - layout.indexOf(b.questionId));
};

const logDownload = async (
  responseIdStatusArray: { id: string; status: string }[],
  format: DownloadFormat,
  formId: string,
  ability: ReturnType<typeof createAbility>,
  userEmail: string
) => {
  await updateLastDownloadedBy(responseIdStatusArray, formId, userEmail);
  responseIdStatusArray.forEach((item) => {
    logEvent(
      ability.userID,
      { type: "Response", id: item.id },
      "DownloadResponse",
      `Downloaded form response in ${format} for submission ID ${item.id}`
    );
  });
};

export const getSubmissionsByFormat = async ({
  formID,
  ids,
  format = DownloadFormat.HTML,
  lang,
}: {
  formID: string;
  ids: string[];
  format: DownloadFormat;
  lang: Language;
}) => {
  try {
    const session = await auth();

    if (!session) {
      throw new Error("User is not authenticated");
    }

    const responseConfirmLimit = Number(await getAppSetting("responseDownloadLimit"));

    const userEmail = session.user.email;

    if (userEmail === null) {
      throw new Error(
        `User does not have an associated email address: ${JSON.stringify(session.user)} `
      );
    }

    const ability = createAbility(session);
    const fullFormTemplate = await getFullTemplateByID(ability, formID);

    if (fullFormTemplate === null) {
      throw new Error("Form not found");
    }

    if (ids.length > responseConfirmLimit) {
      throw new Error(
        `You can only download a maximum of ${responseConfirmLimit} responses at a time.`
      );
    }

    const queryResult = await retrieveSubmissions(ability, formID, ids);

    if (!queryResult) {
      throw new Error("Error retrieving submissions");
    }

    // Get responses into a ResponseSubmission array containing questions and answers that can be easily transformed
    const responses = queryResult.map((item) => {
      const submission = Object.entries(JSON.parse(String(item.formSubmission))).map(
        ([questionId, answer]) => {
          const question = fullFormTemplate.form.elements.find(
            (element) => element.id === Number(questionId)
          );

          if (question?.type === FormElementTypes.dynamicRow && answer instanceof Array) {
            return {
              questionId: question.id,
              type: question?.type,
              questionEn: question?.properties.titleEn,
              questionFr: question?.properties.titleFr,
              answer: answer.map((item) => {
                return Object.values(item).map((value, index) => {
                  if (question?.properties.subElements) {
                    return {
                      questionId: question?.id,
                      type: question?.properties.subElements[index].type,
                      questionEn: question?.properties.subElements[index].properties.titleEn,
                      questionFr: question?.properties.subElements[index].properties.titleFr,
                      answer: value,
                    };
                  }
                });
              }),
            } as Answer;
          }

          return {
            questionId: question?.id,
            type: question?.type,
            questionEn: question?.properties.titleEn,
            questionFr: question?.properties.titleFr,
            answer: question?.type === "checkbox" ? Array(answer).join(", ") : answer,
          } as Answer;
        }
      );
      const sorted = sortByLayout({ layout: fullFormTemplate.form.layout, elements: submission });
      return {
        id: item.name,
        createdAt: parseInt(item.createdAt.toString()),
        confirmationCode: item.confirmationCode,
        answers: sorted,
      };
    }) as FormResponseSubmissions["submissions"];

    const formResponse = {
      form: {
        id: fullFormTemplate.id,
        titleEn: fullFormTemplate.form.titleEn,
        titleFr: fullFormTemplate.form.titleFr,
        securityAttribute: fullFormTemplate.securityAttribute,
      },
      submissions: responses,
    } as FormResponseSubmissions;

    // @TODO
    if (!responses.length) {
      // return NextResponse.json({ error: "No responses found." }, { status: 404 });
    }

    const responseIdStatusArray = queryResult.map((item) => {
      return {
        id: item.name,
        status: item.status,
      };
    });

    await logDownload(responseIdStatusArray, format, formID, ability, userEmail);

    switch (format) {
      case DownloadFormat.CSV:
        return {
          receipt: htmlAggregatedTransform(formResponse, lang),
          responses: csvTransform(formResponse),
        };
      case DownloadFormat.HTML_AGGREGATED:
        return htmlAggregatedTransform(formResponse, lang);

      case DownloadFormat.HTML:
        return htmlTransform(formResponse);

      case DownloadFormat.HTML_ZIPPED: {
        return zipTransform(formResponse, lang);
      }

      case DownloadFormat.JSON:
        return {
          receipt: htmlAggregatedTransform(formResponse, lang),
          responses: jsonTransform(formResponse),
        };

      default:
        throw new Error(`Invalid format: ${format}`);
    }
  } catch (err) {
    if (err instanceof AccessControlError) {
      throw new Error("Forbidden");
    } else {
      logMessage.error(err);
      throw new Error("There was an error. Please try again later.");
    }
  }
};
