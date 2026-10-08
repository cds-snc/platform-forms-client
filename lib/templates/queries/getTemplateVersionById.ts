import { logMessage } from "@lib/logger";
import { prisma } from "@gcforms/database";
import { unstable_noStore as noStore } from "next/cache";

export async function getTemplateVersionById(
  templateId: string,
  versionId: string
): Promise<{ jsonConfig?: string | unknown } | null> {
  noStore();

  const versionRecord = await prisma.templateVersion
    .findUnique({
      where: { id: versionId, templateId },
      select: { jsonConfig: true },
    })
    .catch((e) => {
      logMessage.error(
        `DB error fetching template version by id: ${e instanceof Error ? e.message : String(e)}`
      );
      return null;
    });

  return versionRecord;
}
