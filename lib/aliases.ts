import { prisma } from "@lib/integration/prismaConnector";
import { logMessage } from "@lib/logger";

export const getFormIDByAlias = async (alias: string): Promise<string | null> => {
  try {
    const formAlias = await prisma.formAlias.findUnique({
      where: {
        alias,
      },
      select: {
        formId: true,
      },
    });
    return formAlias?.formId ?? null;
  } catch (e) {
    logMessage.error(e);
    return null;
  }
};
