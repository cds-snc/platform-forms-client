import { authCheckAndThrow } from "@lib/actions";
import { retrieveSubmissions } from "@lib/vault";
import { isResponseId } from "@lib/validation/validation";
import { NextResponse } from "next/server";

type AttachmentLink = {
  name: string;
  downloadLink: string;
};

type BatchSource = {
  sourceUrl: string;
  attachments: AttachmentLink[];
};

const getResponseIdFromUrl = (value: string, formId: string) => {
  const url = new URL(value);
  const pathParts = url.pathname.split("/").filter(Boolean);
  const formBuilderIndex = pathParts.indexOf("form-builder");

  if (
    formBuilderIndex === -1 ||
    pathParts[formBuilderIndex + 1] !== formId ||
    pathParts[formBuilderIndex + 2] !== "response-attachments"
  ) {
    return null;
  }

  const responseId = decodeURIComponent(pathParts[formBuilderIndex + 3] ?? "");
  return responseId && isResponseId(responseId) ? responseId : null;
};

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await authCheckAndThrow();
    const { id: formId } = await params;
    const body = (await request.json()) as { links?: unknown };
    const links = Array.isArray(body.links)
      ? body.links.filter((link): link is string => typeof link === "string")
      : [];

    const sources: BatchSource[] = links.map((sourceUrl) => ({ sourceUrl, attachments: [] }));
    const responseSources = sources
      .map((source, index) => ({
        index,
        responseId: getResponseIdFromUrl(source.sourceUrl, formId),
      }))
      .filter((source): source is { index: number; responseId: string } =>
        Boolean(source.responseId)
      );

    if (responseSources.length) {
      await Promise.all(
        responseSources.map(async ({ index, responseId }) => {
          const [submission] = await retrieveSubmissions(formId, [responseId]);
          sources[index].attachments = (submission?.fileAttachments ?? [])
            .filter(
              (attachment): attachment is typeof attachment & { downloadLink: string } =>
                typeof attachment.downloadLink === "string"
            )
            .map(({ name, downloadLink }) => ({ name, downloadLink }));
        })
      );
    }

    sources.forEach((source) => {
      if (source.attachments.length === 0 && !getResponseIdFromUrl(source.sourceUrl, formId)) {
        const url = new URL(source.sourceUrl);
        source.attachments = [
          {
            name: decodeURIComponent(
              url.pathname.split("/").filter(Boolean).at(-1) ?? "attachment"
            ),
            downloadLink: source.sourceUrl,
          },
        ];
      }
    });

    if (sources.some((source) => source.attachments.length === 0)) {
      return NextResponse.json(
        { error: "One or more response links did not contain downloadable attachments" },
        { status: 422 }
      );
    }

    return NextResponse.json({ sources });
  } catch {
    return NextResponse.json({ error: "Unable to resolve attachment links" }, { status: 400 });
  }
}
