import { AccessControlError, createAbility } from "@lib/privileges";
import { middleware, cors, sessionExists } from "@lib/middleware";
import type { NextApiRequest, NextApiResponse } from "next";
import { FormElementTypes, MiddlewareProps, WithRequired } from "@lib/types";
import { getFullTemplateByID } from "@lib/templates";
import { transform as csvTransform } from "@lib/responseDownloadFormats/csv";
import { transform as xlsxTransform } from "@lib/responseDownloadFormats/xlsx";
import { transform as htmlTableTransform } from "@lib/responseDownloadFormats/html-table";
import { transform as htmlTransform } from "@lib/responseDownloadFormats/html";
import { transform as zipTransform } from "@lib/responseDownloadFormats/html-zipped";
import { retrieveSubmissions, updateLastDownloadedBy } from "@lib/vault";
import { FormResponseSubmissions } from "@lib/responseDownloadFormats/types";
import { logEvent } from "@lib/auditLogs";
import { logMessage } from "@lib/logger";

const getSubmissions = async (
  req: NextApiRequest,
  res: NextApiResponse,
  props: MiddlewareProps
) => {
  try {
    const { session } = props as WithRequired<MiddlewareProps, "session">;
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
    const ids = data.ids.split(",");

    const queryResult = await retrieveSubmissions(ability, formId, ids);

    if (!queryResult)
      return res.status(500).json({ error: "There was an error. Please try again later." });

    // Get responses into a ResponseSubmission array containing questions and answers that can be easily transformed
    const responses = queryResult.submissions.map((item) => {
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
        id: fullFormTemplate.form.id,
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
      const responseIdStatusArray = queryResult.submissions.map((item) => {
        return {
          id: item.name,
          status: item.status,
        };
      });

      await updateLastDownloadedBy(responseIdStatusArray, formId, userEmail);

      responseIdStatusArray.forEach((item) => {
        logEvent(
          ability.userID,
          { type: "Response", id: item.id },
          "DownloadResponse",
          `Downloaded form response for submission ID ${item.id}`
        );
      });

      if (req.query.format === "csv") {
        return res
          .status(200)
          .setHeader("Content-Type", "text/csv charset=utf-8")
          .setHeader("Content-Disposition", `attachment; filename=records.csv`)
          .send(csvTransform(formResponse));
      }

      if (req.query.format === "xlsx") {
        return res
          .status(200)
          .setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          )
          .setHeader("Content-Disposition", `attachment; filename=records.xlsx`)
          .send(xlsxTransform(formResponse));
      }

      if (req.query.format === "html-table") {
        return res
          .status(200)
          .setHeader("Content-Type", "text/html")
          .send(htmlTableTransform(formResponse));
      }

      if (req.query.format === "html") {
        return res
          .status(200)
          .setHeader("Content-Type", "text/json")
          .send(htmlTransform(formResponse));
      }

      if (req.query.format === "html-zipped") {
        const zip = zipTransform(formResponse);

        return res
          .status(200)
          .setHeader("Content-Type", "application/zip")
          .setHeader("Content-Disposition", `attachment; filename=records.zip`)
          .send(zip.generateNodeStream({ type: "nodebuffer", streamFiles: true }));
      }

      if (req.query.format === "json") {
        return res.status(200).json({ ...formResponse });
      }

      return res.status(400).json({ error: `Bad request invalid format ${req.query.format}` });
    }

    // Default repsonse format is JSON
    return res.status(200).json({ ...formResponse });
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
