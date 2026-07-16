import { logMessage } from "@lib/logger";

export async function getTemplateVersionById(
  versionId: string
): Promise<{ jsonConfig?: string | unknown } | null> {
  const db = (await import("@gcforms/database")).prisma;

  const versionRecord = await db.templateVersion
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
