import { AccessControlError, createAbility } from "@lib/privileges";
import { middleware, sessionExists } from "@lib/middleware";
import { NextResponse } from "next/server";
import { FormElementTypes, MiddlewareProps, WithRequired } from "@lib/types";
import { getFullTemplateByID } from "@lib/templates";
import { transform as csvTransform } from "@lib/responseDownloadFormats/csv";
import { transform as htmlAggregatedTransform } from "@lib/responseDownloadFormats/html-aggregated";
import { transform as htmlTransform } from "@lib/responseDownloadFormats/html";
import { transform as zipTransform } from "@lib/responseDownloadFormats/html-zipped";
import { transform as jsonTransform } from "@lib/responseDownloadFormats/json";
import { retrieveSubmissions, updateLastDownloadedBy } from "@lib/vault";
import {
  Answer,
  DownloadFormat,
  FormResponseSubmissions,
} from "@lib/responseDownloadFormats/types";
import { logEvent } from "@lib/auditLogs";
import { logMessage } from "@lib/logger";
import { getAppSetting } from "@lib/appSettings";

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

interface APIProps {
  ids?: string;
}

export const POST = middleware([sessionExists()], async (req, props) => {
  try {
    const { session } = props as WithRequired<MiddlewareProps, "session">;
    const responseConfirmLimit = Number(await getAppSetting("responseDownloadLimit"));
    const formID = props.params?.form;
    const format =
      (req.nextUrl.searchParams.get("format") as DownloadFormat) ?? DownloadFormat.HTML;

    // Format value checks
    if (!format) {
      // Format not specified
      return NextResponse.json({ error: "Bad request please specify a format" }, { status: 400 });
    }

    // Only accept the specified formats
    if (!Object.values(DownloadFormat).includes(format)) {
      return NextResponse.json({ error: `Bad request invalid format ${format}` }, { status: 400 });
    }

    // Note: if we decided in the future to try to detect the user's language, it would make the
    // most sense to use the form submission language vs sesion/*. If not, the output could have
    // e.g. French questions and English answers etc.
    const lang = req.nextUrl.searchParams.get("lang") === "fr" ? "fr" : "en";

    const userEmail = session.user.email;
    if (userEmail === null)
      throw new Error(
        `User does not have an associated email address: ${JSON.stringify(session.user)} `
      );

    if (!formID || typeof formID !== "string") {
      return NextResponse.json({ error: "Bad request" }, { status: 400 });
    }

    const ability = createAbility(session);
    const fullFormTemplate = await getFullTemplateByID(ability, formID);

    if (fullFormTemplate === null)
      return NextResponse.json({ error: "Form Not Found" }, { status: 404 });

    const data: APIProps = props.body;
    const ids: string[] = data.ids?.split(",") ?? [];

    if (ids.length > responseConfirmLimit) {
      return NextResponse.json(
        {
          error: `You can only download a maximum of ${responseConfirmLimit} responses at a time.`,
        },
        { status: 400 }
      );
    }

    const queryResult = await retrieveSubmissions(ability, formID, ids);

    if (!queryResult)
      return NextResponse.json(
        { error: "There was an error. Please try again later." },
        { status: 500 }
      );

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

    if (!responses.length) {
      return NextResponse.json({ error: "No responses found." }, { status: 404 });
    }

    const responseIdStatusArray = queryResult.map((item) => {
      return {
        id: item.name,
        status: item.status,
      };
    });

    await logDownload(
      responseIdStatusArray,
      req.nextUrl.searchParams.get("format") as DownloadFormat,
      formID,
      ability,
      userEmail
    );

    switch (format) {
      case DownloadFormat.CSV:
        return NextResponse.json(
          {
            receipt: htmlAggregatedTransform(formResponse, lang),
            responses: csvTransform(formResponse),
          },
          { headers: { "Content-Type": "text/json" } }
        );

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
        return NextResponse.json(await htmlAggregatedTransform(formResponse, lang), {
          headers: { "Content-Type": "text/html" },
        });

      case DownloadFormat.HTML:
        return NextResponse.json(await htmlTransform(formResponse), {
          headers: { "Content-Type": "text/json" },
        });

      case DownloadFormat.HTML_ZIPPED: {
        return NextResponse.json(await zipTransform(formResponse, lang), {
          headers: { "Content-Type": "text/json" },
        });
      }

      case DownloadFormat.JSON:
        return NextResponse.json({
          receipt: htmlAggregatedTransform(formResponse, lang),
          responses: jsonTransform(formResponse),
        });

      default:
        return NextResponse.json(
          { error: `Bad request invalid format ${format}` },
          { status: 400 }
        );
    }
  } catch (err) {
    if (err instanceof AccessControlError) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    } else {
      logMessage.error(err);
      return NextResponse.json(
        { message: "There was an error. Please try again later." },
        { status: 500 }
      );
    }
  }
});
