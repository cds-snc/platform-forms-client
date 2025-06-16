/**
 *
 * @param fileGroups - An array of file groups (e.g., ["documents", "images", "spreadsheets"]).
 * Converts an array of file groups to an array of file types.
 * Each file group is mapped to its corresponding file types based on predefined file groups.
 * If a file group does not belong to any predefined group, it is ignored.
 * @returns  An array of unique file types (e.g., ["pdf", "txt", "doc", "docx", "jpg", "jpeg", "png", "svg", "xls", "xlsx", "csv", "numbers"]).
 */
export const fileGroupsToFileTypes = (fileGroups: string[]) => {
  const fileTypes = new Set<string>();
  fileGroups.forEach((fileGroup) => {
    const types = fileGroupToFileTypes(fileGroup);
    types.forEach((type: string) => fileTypes.add(type));
  });
  if (fileTypes.size > 0) {
    return Array.from(fileTypes);
  }

  return [];
};

/**
 *
 * @param fileGroup - A file group (e.g., "documents", "images", "spreadsheets").
 * Converts a single file group to an array of file types.
 * Each file group is mapped to its corresponding file types based on predefined file groups.
 * If the file group does not belong to any predefined group, it returns an empty array.
 * @returns An array of file types (e.g., ["pdf", "txt", "doc", "docx"]).
 */
export const fileGroupToFileTypes = (fileGroup: string) => {
  if (fileGroup === "documents") {
    return ["pdf", "txt", "doc", "docx"];
  }
  if (fileGroup === "images") {
    return ["jpg", "jpeg", "png", "svg"];
  }
  if (fileGroup === "spreadsheets") {
    return ["xls", "xlsx", "csv", "numbers"];
  }

  return [];
};
