import { AccessControlError, createAbility } from "@lib/privileges";
import { middleware, cors, sessionExists } from "@lib/middleware";
import type { NextApiRequest, NextApiResponse } from "next";
import { FormElementTypes, MiddlewareProps, WithRequired } from "@lib/types";
import { getFullTemplateByID } from "@lib/templates";
import { transform as csvTransform } from "@lib/responseDownloadFormats/csv";
import { transform as htmlAggregatedTransform } from "@lib/responseDownloadFormats/html-aggregated";
import { transform as htmlTransform } from "@lib/responseDownloadFormats/html";
import { transform as zipTransform } from "@lib/responseDownloadFormats/html-zipped";
import { transform as jsonTransform } from "@lib/responseDownloadFormats/json";
import { retrieveSubmissions, updateLastDownloadedBy } from "@lib/vault";
import { DownloadFormat, FormResponseSubmissions } from "@lib/responseDownloadFormats/types";
import { logEvent } from "@lib/auditLogs";
import { logMessage } from "@lib/logger";
import { getAppSetting } from "@lib/appSettings";

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

const getSubmissions = async (
  req: NextApiRequest,
  res: NextApiResponse,
  props: MiddlewareProps
) => {
  try {
    const { session } = props as WithRequired<MiddlewareProps, "session">;
    const responseConfirmLimit = Number(await getAppSetting("responseDownloadLimit"));
    const formId = req.query.form;

    const userEmail = session.user.email;
    if (userEmail === null)
      throw new Error(
        `User does not have an associated email address: ${JSON.stringify(session.user)} `
      );

    if (!formId || typeof formId !== "string") {
      return res.status(400).json({ error: "Bad request" });
    }

    const ability = createAbility(session);
    const fullFormTemplate = await getFullTemplateByID(ability, formId);

    if (fullFormTemplate === null) return res.status(404).json({ error: "Form Not Found" });

    const data = req.body;
    const ids: string[] = data.ids.split(",");

    if (ids.length > responseConfirmLimit) {
      return res.status(400).json({
        error: `You can only confirm a maximum of ${responseConfirmLimit} responses at a time.`,
      });
    }

    // Note: if we decided in the future to try to detect the user's language, it would make the
    // most sense to use the form submission language vs sesion/*. If not, the output could have
    // e.g. French questions and English answers etc.
    const lang = req.query?.lang === "fr" ? "fr" : "en";

    const queryResult = await retrieveSubmissions(ability, formId, ids);

    if (!queryResult)
      return res.status(500).json({ error: "There was an error. Please try again later." });

    // Get responses into a ResponseSubmission array containing questions and answers that can be easily transformed
    const responses = queryResult.map((item) => {
      const submission = Object.entries(JSON.parse(String(item.formSubmission))).map(
        ([questionId, answer]) => {
          const question = fullFormTemplate.form.elements.find(
            (element) => element.id === Number(questionId)
          );

          if (question?.type === FormElementTypes.dynamicRow && answer instanceof Array) {
            return {
              type: question?.type,
              questionEn: question?.properties.titleEn,
              questionFr: question?.properties.titleFr,
              answer: answer.map((item) => {
                return Object.values(item).map((value, index) => {
                  if (question?.properties.subElements) {
                    return {
                      type: question?.properties.subElements[index].type,
                      questionEn: question?.properties.subElements[index].properties.titleEn,
                      questionFr: question?.properties.subElements[index].properties.titleFr,
                      answer: value,
                    };
                  }
                });
              }),
            };
          }

          return {
            type: question?.type,
            questionEn: question?.properties.titleEn,
            questionFr: question?.properties.titleFr,
            answer: question?.type === "checkbox" ? Array(answer).join(", ") : answer,
          };
        }
      );
      return {
        id: item.name,
        createdAt: parseInt(item.createdAt.toString()),
        confirmationCode: item.confirmationCode,
        answers: submission,
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

    if (!responses.length) {
      return res.status(404).json({ error: "No responses found." });
    }

    if (req.query.format) {
      // Only accept the specified formats
      if (!Object.values(DownloadFormat).includes(req.query.format as DownloadFormat)) {
        return res.status(400).json({ error: `Bad request invalid format ${req.query.format}` });
      }

      const responseIdStatusArray = queryResult.map((item) => {
        return {
          id: item.name,
          status: item.status,
        };
      });

      await logDownload(
        responseIdStatusArray,
        req.query.format as DownloadFormat,
        formId,
        ability,
        userEmail
      );

      switch (req.query.format) {
        case DownloadFormat.CSV:
          return res
            .status(200)
            .setHeader("Content-Type", "text/json")
            .send({
              receipt: htmlAggregatedTransform(formResponse),
              responses: csvTransform(formResponse),
            });

        // Disabling for now. If this get's re-enabled in future, will need to install
        // the "node-xlsx" package.
        // case DownloadFormat.XLSX:
        //   return res
        //     .status(200)
        //     .setHeader(
        //       "Content-Type",
        //       "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        //     )
        //     .setHeader("Content-Disposition", `attachment; filename=records.xlsx`)
        //     .send(xlsxTransform(formResponse));
        //   break;

        case DownloadFormat.HTML_AGGREGATED:
          return res
            .status(200)
            .setHeader("Content-Type", "text/html")
            .send(htmlAggregatedTransform(formResponse, lang));

        case DownloadFormat.HTML:
          return res
            .status(200)
            .setHeader("Content-Type", "text/json")
            .send(htmlTransform(formResponse));

        case DownloadFormat.HTML_ZIPPED: {
          const zip = zipTransform(formResponse);

          return res
            .status(200)
            .setHeader("Content-Type", "application/zip")
            .setHeader("Content-Disposition", `attachment; filename=records.zip`)
            .send(zip.generateNodeStream({ type: "nodebuffer", streamFiles: true }));
        }

        case DownloadFormat.JSON:
          return res.status(200).json({
            receipt: htmlAggregatedTransform(formResponse),
            responses: jsonTransform(formResponse),
          });

        default:
          return res.status(400).json({ error: `Bad request invalid format ${req.query.format}` });
      }
    }

    // Format not specified
    return res.status(400).json({ error: "Bad request please specify a format" });
  } catch (err) {
    if (err instanceof AccessControlError) {
      return res.status(403).json({ error: "Forbidden" });
    } else {
      logMessage.error(err);
      return res.status(500).json({ message: "There was an error. Please try again later." });
    }
  }
};

export default middleware([cors({ allowedMethods: ["POST"] }), sessionExists()], getSubmissions);
