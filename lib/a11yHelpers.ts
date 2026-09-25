export const getErrorMessageId = (id: string): string | undefined =>
  id ? `errorMessage-${id}` : undefined;

export const getDescribedByIds = (...ids: Array<string | undefined>): string | undefined => {
  // Try to keep the error ID first so it is prioritized in announcements
  const result = ids.filter(Boolean).join(" ");
  return result || undefined;
};
