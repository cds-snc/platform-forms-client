"use server";
import { Language } from "@lib/types/form-builder-types";
import { getAppSetting } from "@lib/appSettings";
import { logEvent } from "@lib/auditLogs";
import { auth } from "@lib/auth";
import { ucfirst } from "@lib/client/clientHelpers";
import { createAbility } from "@lib/privileges";
import {
  Answer,
  DownloadFormat,
  FormResponseSubmissions,
} from "@lib/responseDownloadFormats/types";
import { getFullTemplateByID } from "@lib/templates";
import { FormElementTypes, VaultStatus } from "@lib/types";
import { isResponseId } from "@lib/validation/validation";
import { listAllSubmissions, retrieveSubmissions, updateLastDownloadedBy } from "@lib/vault";
import { transform as csvTransform } from "@lib/responseDownloadFormats/csv";
import { transform as htmlAggregatedTransform } from "@lib/responseDownloadFormats/html-aggregated";
import { transform as htmlTransform } from "@lib/responseDownloadFormats/html";
import { transform as zipTransform } from "@lib/responseDownloadFormats/html-zipped";
import { transform as jsonTransform } from "@lib/responseDownloadFormats/json";
import { logMessage } from "@lib/logger";
import { revalidatePath } from "next/cache";

// Can throw because it is not called by Client Components
// @todo Should these types of functions be moved to a different file?
export const fetchTemplate = async (id: string) => {
  const session = await auth();

  if (!session) {
    throw new Error("User is not authenticated");
  }

  const ability = createAbility(session);
  const template = await getFullTemplateByID(ability, id);

  return template;
};

// Can throw because it is not called by Client Components
// @todo Should these types of functions be moved to a different file?
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
    undefined,
    currentLastEvaluatedKey
  );

  return { submissions, lastEvaluatedKey };
};

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
  revalidate = false,
}: {
  formID: string;
  ids: string[];
  format: DownloadFormat;
  lang: Language;
  revalidate?: boolean;
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

    if (!responses.length) {
      throw new Error("No responses found.");
    }

    const formResponse = {
      form: {
        id: fullFormTemplate.id,
        titleEn: fullFormTemplate.form.titleEn,
        titleFr: fullFormTemplate.form.titleFr,
        securityAttribute: fullFormTemplate.securityAttribute,
      },
      submissions: responses,
    } as FormResponseSubmissions;

    const responseIdStatusArray = queryResult.map((item) => {
      return {
        id: item.name,
        status: item.status,
      };
    });

    await logDownload(responseIdStatusArray, format, formID, ability, userEmail);

    const revalidateNewTab = async () => {
      // delay revalidation so new tab doesn't refresh immediately
      await new Promise((resolve) => setTimeout(resolve, 5));
      revalidatePath(`${lang}/form-builder/${formID}/responses/new`, "page");
    };

    switch (format) {
      case DownloadFormat.CSV:
        revalidate && revalidateNewTab();
        return {
          receipt: await htmlAggregatedTransform(formResponse, lang),
          responses: csvTransform(formResponse),
        };
      case DownloadFormat.HTML_AGGREGATED:
        revalidate && revalidateNewTab();
        return await htmlAggregatedTransform(formResponse, lang);

      case DownloadFormat.HTML:
        revalidate && revalidateNewTab();
        return await htmlTransform(formResponse);

      case DownloadFormat.HTML_ZIPPED: {
        revalidate && revalidateNewTab();
        return await zipTransform(formResponse, lang);
      }

      case DownloadFormat.JSON:
        revalidate && revalidateNewTab();
        return {
          receipt: await htmlAggregatedTransform(formResponse, lang),
          responses: jsonTransform(formResponse),
        };

      default:
        throw new Error(`Invalid format: ${format}`);
    }
  } catch (err) {
    logMessage.error(`Could not create submissions in format ${format}: ${(err as Error).message}`);
    return { error: "There was an error. Please try again later." };
  }
};
