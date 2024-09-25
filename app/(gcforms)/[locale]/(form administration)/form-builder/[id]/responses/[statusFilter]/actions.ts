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
import { AddressComponents, FormElement, FormElementTypes, VaultStatus } from "@lib/types";
import { isResponseId } from "@lib/validation/validation";
import {
  confirmResponses,
  listAllSubmissions,
  retrieveSubmissions,
  updateLastDownloadedBy,
} from "@lib/vault";
import { transform as csvTransform } from "@lib/responseDownloadFormats/csv";
import { transform as htmlAggregatedTransform } from "@lib/responseDownloadFormats/html-aggregated";
import { transform as htmlTransform } from "@lib/responseDownloadFormats/html";
import { transform as zipTransform } from "@lib/responseDownloadFormats/html-zipped";
import { transform as jsonTransform } from "@lib/responseDownloadFormats/json";
import { logMessage } from "@lib/logger";
import { revalidatePath } from "next/cache";
import { authCheckAndRedirect, authCheckAndThrow } from "@lib/actions";
import { FormBuilderError } from "./exceptions";
import { FormProperties } from "@lib/types";
import { getLayoutFromGroups } from "@lib/utils/form-builder/groupedFormHelpers";
import { allowGrouping } from "@formBuilder/components/shared/right-panel/treeview/util/allowGrouping";
import { orderGroups } from "@lib/utils/form-builder/orderUsingGroupsLayout";
import { formHasGroups } from "@lib/utils/form-builder/formHasGroups";
import { DateFormat, DateObject } from "@clientComponents/forms/FormattedDate/types";
import { getFormattedDateFromObject } from "@clientComponents/forms/FormattedDate/utils";
import { AddressElements } from "@clientComponents/forms/AddressComplete/types";
import {
  getAddressAsAnswerElements,
  getAddressAsString,
} from "@clientComponents/forms/AddressComplete/utils";

export const fetchSubmissions = async ({
  formId,
  status,
  lastKey,
}: {
  formId: string;
  status: string;
  lastKey: string | null;
}) => {
  try {
    const { session, ability } = await authCheckAndThrow().catch(() => ({
      session: null,
      ability: null,
    }));

    if (!session) {
      throw new Error("User is not authenticated");
    }

    if (!formId) {
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
  } catch (e) {
    logMessage.error(`Error fetching submissions for form ${formId}: ${(e as Error).message}`);
    return { error: true, submissions: [], lastEvaluatedKey: null };
  }
};

const sortByLayout = ({ layout, elements }: { layout: number[]; elements: Answer[] }) => {
  return elements.sort((a, b) => layout.indexOf(a.questionId) - layout.indexOf(b.questionId));
};

const sortByGroups = ({ form, elements }: { form: FormProperties; elements: Answer[] }) => {
  const groups = orderGroups(form.groups, form.groupsLayout) ?? {};
  const layout = getLayoutFromGroups(form, groups);
  return sortByLayout({ layout, elements });
};

const getAnswerAsString = (question: FormElement | undefined, answer: unknown): string => {
  if (question && question.type === "checkbox") {
    return Array(answer).join(", ");
  }

  if (question && question.type === "formattedDate") {
    // Could be empty if the date was not required
    if (!answer) {
      return "";
    }
    const dateFormat = (question.properties.dateFormat || "YYYY-MM-DD") as DateFormat;
    const dateObject = JSON.parse(answer as string) as DateObject;

    return getFormattedDateFromObject(dateFormat, dateObject);
  }

  if (question && question.type === "addressComplete") {
    if (!answer) {
      return "";
    }

    if (question.properties.full === false) {
      return answer as string;
    }

    const addressObject = JSON.parse(answer as string) as AddressElements;
    return getAddressAsString(addressObject);
  }

  return answer as string;
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
  extraTranslations = {},
}: {
  formID: string;
  ids: string[];
  format: DownloadFormat;
  lang: Language;
  revalidate?: boolean;
  extraTranslations?: { [key: string]: { en: string; fr: string } };
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

    const allowGroupsFlag = allowGrouping();
    // Get responses into a ResponseSubmission array containing questions and answers that can be easily transformed
    const responses = queryResult.map((item) => {
      const submission = Object.entries(JSON.parse(String(item.formSubmission))).map(
        ([questionId, answer]) => {
          const question = fullFormTemplate.form.elements.find(
            (element) => element.id === Number(questionId)
          );

          // Handle Dynamic Rows
          if (question?.type === FormElementTypes.dynamicRow && answer instanceof Array) {
            return {
              questionId: question.id,
              type: question?.type,
              questionEn: question?.properties.titleEn,
              questionFr: question?.properties.titleFr,
              answer: answer.map((item) => {
                return Object.values(item).map((value, index) => {
                  if (question?.properties.subElements) {
                    const subQuestion = question?.properties.subElements[index];
                    return {
                      questionId: question?.id,
                      type: subQuestion.type,
                      questionEn: subQuestion.properties.titleEn,
                      questionFr: subQuestion.properties.titleFr,
                      answer: getAnswerAsString(subQuestion, value),
                      ...(subQuestion.type === "formattedDate" && {
                        dateFormat: subQuestion.properties.dateFormat,
                      }),
                    };
                  }
                });
              }),
            } as Answer;
          }

          // Handle "Split" AddressComplete in a similiar manner to dynamic fields.
          if (
            question?.type === FormElementTypes.addressComplete &&
            question.properties.full === false
          ) {
            const addressObject = JSON.parse(answer as string) as AddressElements;

            const questionComponents = question.properties.addressComponents as AddressComponents;

            const reviewElements = getAddressAsAnswerElements(
              question,
              addressObject,
              questionComponents,
              extraTranslations
            );
            const addressElements = [reviewElements];

            return {
              questionId: question.id,
              type: FormElementTypes.address,
              questionEn: question?.properties.titleEn,
              questionFr: question?.properties.titleFr,
              answer: addressElements,
            } as Answer;
          }

          // return the final answer object
          return {
            questionId: question?.id,
            type: question?.type,
            questionEn: question?.properties.titleEn,
            questionFr: question?.properties.titleFr,
            answer: getAnswerAsString(question, answer),
            ...(question?.type === "formattedDate" && {
              dateFormat: question.properties.dateFormat,
            }),
          } as Answer;
        }
      );
      let sorted: Answer[];
      if (allowGroupsFlag && formHasGroups(fullFormTemplate.form)) {
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

export const confirmSubmissionCodes = async (confirmationCodes: string[], formId: string) => {
  try {
    const { ability } = await authCheckAndRedirect();

    return confirmResponses(ability, confirmationCodes, formId);
  } catch (e) {
    logMessage.warn(
      `Error confirming submission codes for formId ${formId}: ${(e as Error).message}`
    );
    // Throw sanitized error back to client
    throw new Error("There was an error. Please try again later.");
  }
};
