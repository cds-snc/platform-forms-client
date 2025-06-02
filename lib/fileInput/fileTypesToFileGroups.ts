import { FILE_GROUPS } from "./constants";

/**
 *
 * @param fileTypes - An array of file types (e.g., ["pdf", "jpg", "xlsx"]).
 * Converts an array of file types to an array of file groups.
 * Each file type is mapped to its corresponding group based on predefined file groups.
 * If a file type does not belong to any group, it is ignored.
 * @returns An array of unique file groups (e.g., ["documents", "images", "spreadsheets"]).
 */
export const fileTypesToFileGroups = (fileTypes: string[]) => {
  const fileGroups = new Set<string>();
  fileTypes.forEach((fileType) => {
    const group = toFileGroup(fileType);
    if (group) {
      fileGroups.add(group);
    }
  });
  return Array.from(fileGroups);
};

/**
 * Converts a single file type to its corresponding file group.
 * If the file type does not belong to any predefined group, it returns null.
 *
 * @param fileType - A single file type (e.g., "pdf", "jpg", "xlsx").
 * @returns The corresponding file group (e.g., "documents", "images", "spreadsheets") or null if not found.
 */
export const toFileGroup = (fileType: string) => {
  if (FILE_GROUPS.documents.types.includes(fileType)) {
    return "documents";
  }
  if (FILE_GROUPS.images.types.includes(fileType)) {
    return "images";
  }
  if (FILE_GROUPS.spreadsheets.types.includes(fileType)) {
    return "spreadsheets";
  }
  return null;
};
