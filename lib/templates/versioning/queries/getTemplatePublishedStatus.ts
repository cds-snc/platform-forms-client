import { getTemplateVersionState } from "./getTemplateVersionState";

export async function getTemplatePublishedStatus(formID: string): Promise<boolean | null> {
  const templateVersionState = await getTemplateVersionState(formID);

  if (!templateVersionState) {
    return null;
  }

  return templateVersionState.isPublished;
}
