"use server";

import { Language, FormServerErrorCodes, ServerActionError } from "@lib/types/form-builder-types";
import { getAppSetting } from "@lib/appSettings";
import { AuditLogEvent, AuditLogDetails, logEvent } from "@lib/auditLogs";
import { ucfirst } from "@lib/client/clientHelpers";
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
import { getFullTemplateByID } from "@lib/templates/queries/getFullTemplateByID";
import { StartFromExclusiveResponse, VaultStatus } from "@lib/types";
import { isResponseId } from "@lib/validation/validation";
import {
  confirmResponses,
  listAllSubmissions,
  retrieveSubmissions,
  updateLastDownloadedBy,
  submissionTypeExists,
  retrieveSubmissionRemovalDate,
} from "@lib/vault";
import { transform as csvTransform } from "@lib/responseDownloadFormats/csv";
import { transform as htmlAggregatedTransform } from "@lib/responseDownloadFormats/html-aggregated";
import { transform as htmlTransform } from "@lib/responseDownloadFormats/html";
import { transform as zipTransform } from "@lib/responseDownloadFormats/html-zipped";
import { transform as jsonTransform } from "@lib/responseDownloadFormats/json";
import { logMessage } from "@lib/logger";
import { AuthenticatedAction } from "@lib/actions";
import { FormBuilderError } from "./exceptions";
import { FormProperties } from "@lib/types";
import { getLayoutFromGroups } from "@lib/utils/form-builder/groupedFormHelpers";
import { allowGrouping } from "@root/lib/groups/utils/allowGrouping";
import { orderGroups } from "@lib/utils/form-builder/orderUsingGroupsLayout";
import { formHasGroups } from "@lib/utils/form-builder/formHasGroups";
import { traceFunction } from "@lib/otel";
import { isTemplateVersioningEnabled } from "@lib/templates/versioning/internal";
import { mapAnswers } from "@lib/responses/mapper/mapAnswers";
import type { Response } from "@gcforms/types";

const IGNORED_KEYS = ["formID", "securityAttribute"];

type ResponseVersion = string | number | null;

const parseTemplateVersionNumber = (version?: ResponseVersion) => {
  if (version === undefined || version === null || version === "") return undefined;

  if (typeof version === "number") {
    return Number.isInteger(version) && version > 0 ? version : undefined;
  }

  const match = version.trim().match(/^v?(\d+)$/i);
  return match ? Number.parseInt(match[1], 10) : undefined;
};

// Public facing functions - they can be used by anyone who finds the associated server action identifer

export const fetchSubmissions = AuthenticatedAction(
  async (
    _,
    {
      formId,
      status,
      lastKey,
    }: {
      formId: string;
      status: string;
      lastKey: string | null;
    }
  ) => {
    return traceFunction("fetchResponseSubmissions", async () => {
      try {
        if (!formId) {
          return {
            submissions: [],
          };
        }

        // get status from url params (default = new) and capitalize/cast to VaultStatus
        // Protect against invalid status query
        const selectedStatus = Object.values(VaultStatus).includes(ucfirst(status) as VaultStatus)
          ? (ucfirst(status) as VaultStatus)
          : VaultStatus.NEW;

        let startFromExclusiveResponse: StartFromExclusiveResponse | undefined = undefined;

        // build up startFromExclusiveResponse from lastKey url param
        if (lastKey) {
          const splitLastKey = lastKey.split("_");

          // Make sure both components of lastKey are valid
          if (
            isResponseId(String(splitLastKey[0])) &&
            isNaN(new Date(Number(splitLastKey[1])).getTime()) === false
          ) {
            startFromExclusiveResponse = {
              name: splitLastKey[0],
              status: selectedStatus,
              createdAt: Number(splitLastKey[1]),
            };
          }
        }

        const { submissions, startFromExclusiveResponse: nextStartFromExclusiveResponse } =
          await listAllSubmissions(formId, selectedStatus, undefined, startFromExclusiveResponse);

        return { submissions, startFromExclusiveResponse: nextStartFromExclusiveResponse };
      } catch (e) {
        logMessage.error(`Error fetching submissions for form ${formId}: ${(e as Error).message}`);
        return { error: true, submissions: [] };
      }
    });
  }
);

export const getSubmissionsByFormat = AuthenticatedAction(
  async (
    session,
    {
      formID,
      ids,
      format = DownloadFormat.HTML,
      lang,
      version,
    }: {
      formID: string;
      ids: string[];
      format: DownloadFormat;
      lang: Language;
      version?: ResponseVersion;
    }
  ): Promise<
    | HtmlResponse
    | HtmlZippedResponse
    | HtmlAggregatedResponse
    | CSVResponse
    | JSONResponse
    | ServerActionError
  > => {
    return traceFunction("generateSubmissionResponseFormats", async () => {
      try {
        const responseConfirmLimit = Number(await getAppSetting("responseDownloadLimit"));

        const templateVersioningEnabled = await isTemplateVersioningEnabled();
        const templateVersionNumber = templateVersioningEnabled
          ? parseTemplateVersionNumber(version)
          : undefined;

        if (templateVersioningEnabled && version && templateVersionNumber === undefined) {
          throw new FormBuilderError(
            `Invalid response version: ${version}`,
            FormServerErrorCodes.DOWNLOAD_INVALID_FORMAT
          );
        }

        let fullFormTemplate = await getFullTemplateByID(formID, undefined, templateVersionNumber);

        // Note: this code can be removed once the backend is updated to support versioned templates for all forms. The fallback logic is only needed for forms that do not yet have versioned templates.

        // Fallback: only allow fallback to non-versioned template when version 1
        // was requested. This covers the case where responses were collected
        // before any versions were created and the UI requests version 1.
        if (fullFormTemplate === null && templateVersioningEnabled && templateVersionNumber === 1) {
          fullFormTemplate = await getFullTemplateByID(formID);
        }

        if (fullFormTemplate === null) {
          logMessage.warn(`getSubmissionsByFormat form not found: ${formID}`);
          throw new FormBuilderError("Form not found", FormServerErrorCodes.FORM_NOT_FOUND);
        }

        if (ids.length > responseConfirmLimit) {
          throw new FormBuilderError(
            `You can only download a maximum of ${responseConfirmLimit} responses at a time.`,
            FormServerErrorCodes.DOWNLOAD_LIMIT_EXCEEDED
          );
        }

        const queryResult = await retrieveSubmissions(formID, ids);

        if (!queryResult) {
          throw new FormBuilderError(
            "Error retrieving submissions",
            FormServerErrorCodes.DOWNLOAD_RETRIEVE_SUBMISSIONS
          );
        }

        const allowGroupsFlag = allowGrouping();
        // Get responses into a ResponseSubmission array containing questions and answers that can be easily transformed
        const responses = queryResult
          .sort((a, b) => a.createdAt - b.createdAt)
          .map((item) => {
            const filteredSubmissionData = JSON.parse(String(item.formSubmission));
            // Remove ignored keys from the submission data
            Object.keys(filteredSubmissionData).forEach((key) => {
              if (IGNORED_KEYS.includes(key)) {
                delete filteredSubmissionData[key];
              }
            });
            const submission = mapAnswers({
              formTemplate: fullFormTemplate.form,
              rawAnswers: filteredSubmissionData as Record<string, Response>,
            });

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
          throw new FormBuilderError(
            "No responses found.",
            FormServerErrorCodes.NO_RESPONSES_FOUND
          );
        }

        const formResponse = {
          formRecord: fullFormTemplate,
          submissions: responses,
        } as FormResponseSubmissions;

        const responseIdStatusArray = queryResult.map((item) => {
          return {
            id: item.name,
            status: item.status,
            createdAt: item.createdAt,
          };
        });

        await updateLastDownloadedBy(responseIdStatusArray, formID);
        await logDownload(responseIdStatusArray, format, session.user.id);

        switch (format) {
          case DownloadFormat.CSV:
            return {
              receipt: await htmlAggregatedTransform(formResponse, lang),
              responses: await csvTransform(formResponse),
            };
          case DownloadFormat.HTML_AGGREGATED:
            return await htmlAggregatedTransform(formResponse, lang);

          case DownloadFormat.HTML:
            return await htmlTransform(formResponse);

          case DownloadFormat.HTML_ZIPPED: {
            return await zipTransform(formResponse, lang);
          }

          case DownloadFormat.JSON:
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
        logMessage.warn(
          `Could not create submissions in format ${format} formId: ${formID}: ${
            (err as Error).message
          }`
        );

        if (err instanceof FormBuilderError) {
          return {
            error: "There was an error. Please try again later.",
            code: err.code,
          } as ServerActionError;
        } else {
          return { error: "There was an error. Please try again later." } as ServerActionError;
        }
      }
    });
  }
);

export const confirmSubmissionCodes = AuthenticatedAction(
  async (_, confirmationCodes: string[], formId: string) => {
    return traceFunction("confirmResponseWithCodes", async () => {
      try {
        return confirmResponses(confirmationCodes, formId);
      } catch (e) {
        logMessage.warn(
          `Error confirming submission codes for formId ${formId}: ${(e as Error).message}`
        );
        // Throw sanitized error back to client
        throw new Error("There was an error. Please try again later.");
      }
    });
  }
);

export const newResponsesExist = AuthenticatedAction(async (_, formId: string) => {
  try {
    return submissionTypeExists(formId, VaultStatus.NEW);
  } catch (error) {
    // Throw sanitized error back to client
    return { error: "There was an error. Please try again later." } as ServerActionError;
  }
});

export const unConfirmedResponsesExist = AuthenticatedAction(async (_, formId: string) => {
  try {
    return submissionTypeExists(formId, VaultStatus.DOWNLOADED);
  } catch (error) {
    // Throw sanitized error back to client
    return { error: "There was an error. Please try again later." } as ServerActionError;
  }
});

export const getSubmissionRemovalDate = AuthenticatedAction(
  async (_, formId: string, submissionName: string) => {
    try {
      return retrieveSubmissionRemovalDate(formId, submissionName);
    } catch (error) {
      // Throw sanitized error back to client
      return { error: "There was an error. Please try again later." } as ServerActionError;
    }
  }
);

// Internal and private functions - won't be converted into server actions

const sortByLayout = ({ layout, elements }: { layout: number[]; elements: Answer[] }) => {
  return elements.sort((a, b) => layout.indexOf(a.questionId) - layout.indexOf(b.questionId));
};

const sortByGroups = ({ form, elements }: { form: FormProperties; elements: Answer[] }) => {
  const groups = orderGroups(form.groups, form.groupsLayout) ?? {};
  const layout = getLayoutFromGroups(form, groups);
  return sortByLayout({ layout, elements });
};

const logDownload = async (
  responseIdStatusArray: { id: string; status: string }[],
  format: DownloadFormat,
  userId: string
) => {
  responseIdStatusArray.forEach((item) => {
    logEvent(
      userId,
      { type: "Response", id: item.id },
      AuditLogEvent.DownloadResponse,
      AuditLogDetails.DownloadedFormResponses,
      { format: format, "item.id": item.id }
    );
  });
};
