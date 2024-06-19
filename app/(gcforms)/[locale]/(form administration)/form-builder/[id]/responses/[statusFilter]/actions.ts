"use server";
import { Language, FormServerErrorCodes, ServerActionError } from "@lib/types/form-builder-types";
import { getAppSetting } from "@lib/appSettings";
import { logEvent } from "@lib/auditLogs";

import { ucfirst } from "@lib/client/clientHelpers";
import { AccessControlError, createAbility } from "@lib/privileges";
import {
  Answer,
  CSVResponse,
  DownloadFormat,
  FormResponseSubmissions,
  HtmlAggregatedResponse,
  HtmlResponse,
  HtmlZippedResponse,
  JSONResponse,
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
import { authCheckAndThrow } from "@lib/actions";
import { FormBuilderError } from "./exceptions";
import { FormProperties } from "@lib/types";
import { getLayoutFromGroups } from "@lib/utils/form-builder/groupedFormHelpers";
import { allowGrouping } from "@formBuilder/components/shared/right-panel/treeview/util/allowGrouping";

// Can throw because it is not called by Client Components
// @todo Should these types of functions be moved to a different file?
export const fetchTemplate = async (id: string) => {
  const { session, ability } = await authCheckAndThrow().catch(() => ({
    session: null,
    ability: null,
  }));
  if (!session) {
    throw new Error("User is not authenticated");
  }

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
  const { session, ability } = await authCheckAndThrow().catch(() => ({
    session: null,
    ability: null,
  }));

  if (!session) {
    throw new Error("User is not authenticated");
  }

  if (formId === "0000") {
    return {
      submissions: [],
      lastEvaluatedKey: null,
    };
  }

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

const sortByGroups = ({ form, elements }: { form: FormProperties; elements: Answer[] }) => {
  const groups = form.groups || {};
  const layout = getLayoutFromGroups(form, groups);
  return sortByLayout({ layout, elements });
};

const logDownload = async (
  responseIdStatusArray: { id: string; status: string }[],
  format: DownloadFormat,
  ability: ReturnType<typeof createAbility>
) => {
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
}): Promise<
  | HtmlResponse
  | HtmlZippedResponse
  | HtmlAggregatedResponse
  | CSVResponse
  | JSONResponse
  | ServerActionError
> => {
  try {
    const { session, ability } = await authCheckAndThrow().catch(() => ({
      session: null,
      ability: null,
    }));

    if (!session) {
      throw new AccessControlError("User is not authenticated");
    }

    const responseConfirmLimit = Number(await getAppSetting("responseDownloadLimit"));

    const userEmail = session.user.email;

    if (userEmail === null) {
      throw new AccessControlError(
        `User does not have an associated email address: ${JSON.stringify(session.user)}`
      );
    }

    const fullFormTemplate = await getFullTemplateByID(ability, formID);

    if (fullFormTemplate === null) {
      throw new FormBuilderError("Form not found", FormServerErrorCodes.FORM_NOT_FOUND);
    }

    if (ids.length > responseConfirmLimit) {
      throw new FormBuilderError(
        `You can only download a maximum of ${responseConfirmLimit} responses at a time.`,
        FormServerErrorCodes.DOWNLOAD_LIMIT_EXCEEDED
      );
    }

    const queryResult = await retrieveSubmissions(ability, formID, ids);

    if (!queryResult) {
      throw new FormBuilderError(
        "Error retrieving submissions",
        FormServerErrorCodes.DOWNLOAD_RETRIEVE_SUBMISSIONS
      );
    }

    const allowGroupsFlag = await allowGrouping();
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
      let sorted: Answer[];
      if (allowGroupsFlag) {
        sorted = sortByGroups({ form: fullFormTemplate.form, elements: submission });
      } else {
        sorted = sortByLayout({ layout: fullFormTemplate.form.layout, elements: submission });
      }

      return {
        id: item.name,
        createdAt: parseInt(item.createdAt.toString()),
        confirmationCode: item.confirmationCode,
        answers: sorted,
      };
    }) as FormResponseSubmissions["submissions"];

    if (!responses.length) {
      throw new FormBuilderError("No responses found.", FormServerErrorCodes.NO_RESPONSES_FOUND);
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

    await updateLastDownloadedBy(responseIdStatusArray, formID, userEmail);
    await logDownload(responseIdStatusArray, format, ability);

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
        throw new FormBuilderError(
          `Invalid format: ${format}`,
          FormServerErrorCodes.DOWNLOAD_INVALID_FORMAT
        );
    }
  } catch (err) {
    logMessage.error(`Could not create submissions in format ${format}: ${(err as Error).message}`);

    if (err instanceof FormBuilderError) {
      return {
        error: "There was an error. Please try again later.",
        code: err.code,
      } as ServerActionError;
    } else {
      return { error: "There was an error. Please try again later." } as ServerActionError;
    }
  }
};
