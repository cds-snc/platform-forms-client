export const parseAnswersField = (
  jsonData: Record<string, unknown>
): Record<string, unknown> | null => {
  if (!jsonData || typeof jsonData !== "object") return null;
  const v = (jsonData as Record<string, unknown>)["answers"];
  if (!v) return null;
  if (typeof v === "string") {
    try {
      const parsed = JSON.parse(v);
      return typeof parsed === "object" && parsed !== null
        ? (parsed as Record<string, unknown>)
        : null;
    } catch (e) {
      // parsing failed
      return null;
    }
  }
  if (typeof v === "object") return v as Record<string, unknown>;
  return null;
};

const helpers = { parseAnswersField };
export default helpers;
