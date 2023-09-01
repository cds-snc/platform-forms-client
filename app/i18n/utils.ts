export const pathLanguageDetection = (path: string, languages: string[]) => {
  const pathRegEx = new RegExp(`^/(${languages.join("|")})`);
  const match = path.match(pathRegEx);
  return match ? match[1] : null;
};
