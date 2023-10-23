import { AccessControlError, createAbility } from "@lib/privileges";
import { middleware, cors, sessionExists } from "@lib/middleware";
import type { NextApiRequest, NextApiResponse } from "next";
import { MiddlewareProps, WithRequired } from "@lib/types";
import { getFullTemplateByID } from "@lib/templates";
import { transform as csvTransform } from "@lib/transformers/csv";
import { transform as xlsxTransform } from "@lib/transformers/xlsx";
import { transform as htmlTableTransform } from "@lib/transformers/html-table";
import { transform as htmlTransform } from "@lib/transformers/html";
import { retrieveSubmissions } from "@lib/vault";

const getSubmissions = async (
  req: NextApiRequest,
  res: NextApiResponse,
  props: MiddlewareProps
) => {
  try {
    const { session } = props as WithRequired<MiddlewareProps, "session">;
    const formId = req.query.form;

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

    const responses = queryResult.submissions.map((item) => {
      const submission = Object.entries(item.formSubmission).map(([questionId, answer]) => {
        const question = fullFormTemplate.form.elements.find(
          (element) => element.id === Number(questionId)
        );
        return {
          questionEn: question?.properties.titleEn,
          questionFr: question?.properties.titleFr,
          answer: Array.isArray(answer) ? answer.join(",") : answer,
        };
      });

      const answers: Record<string, string> = {};

      submission.forEach((answer) => {
        if (answer.questionEn) {
          const key = answer.questionEn;
          answers[key] = answer.answer as string;
        }
      });

      return {
        id: item.name,
        created_at: item.createdAt,
        confirmation_code: item.confirmationCode,
        ...answers,
      };
    });

    if (!responses) {
      return res.status(500).json({ error: "There was an error. Please try again later." });
    }

    if (req.query.format) {
      if (req.query.format === "csv") {
        return res
          .status(200)
          .setHeader("Content-Type", "text/csv")
          .setHeader("Content-Disposition", `attachment; filename=records.csv`)
          .send(csvTransform(responses));
      }

      if (req.query.format === "xlsx") {
        return res
          .status(200)
          .setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          )
          .setHeader("Content-Disposition", `attachment; filename=records.xlsx`)
          .send(xlsxTransform(responses));
      }

      if (req.query.format === "html-table") {
        return res
          .status(200)
          .setHeader("Content-Type", "text/html")
          .send(htmlTableTransform(responses));
      }

      if (req.query.format === "html") {
        return res
          .status(200)
          .setHeader("Content-Type", "text/json")
          .send(htmlTransform(responses, fullFormTemplate));
      }

      return res.status(200).json("format requested: " + req.query.format);
    }

    // Default repsonse format is JSON
    return res.status(200).json({ responses: responses });
  } catch (err) {
    if (err instanceof AccessControlError) return res.status(403).json({ error: "Forbidden" });
    else
      return res
        .status(500)
        .json({ message: "There was an error. Please try again later.", error: err });
  }
};

export default middleware([cors({ allowedMethods: ["POST"] }), sessionExists()], getSubmissions);
