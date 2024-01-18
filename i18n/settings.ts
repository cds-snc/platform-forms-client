export const fallbackLng = "en";
export const languages = [fallbackLng, "fr"];

export const defaultNS = "common";

export function getOptions(lang: string = fallbackLng, ns: string | string[] = defaultNS) {
  return {
    supportedLngs: languages,
    fallbackLng,
    lng: lang,
    fallbackNS: defaultNS,
    defaultNS,
    ns,
  };
}
