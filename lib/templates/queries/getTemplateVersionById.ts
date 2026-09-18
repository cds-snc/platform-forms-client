import { logMessage } from "@lib/logger";
import { prisma } from "@gcforms/database";

export async function getTemplateVersionById(
  versionId: string
): Promise<{ jsonConfig?: string | unknown } | null> {
  const versionRecord = await prisma.templateVersion
    .findUnique({
      where: { id: versionId },
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
