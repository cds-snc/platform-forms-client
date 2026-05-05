import fs from "fs";
import path from "path";

type TranslationValues = Record<string, unknown>;
type TranslationOptions = Record<string, unknown> & { lng?: string };

type TranslationModule = {
  useTranslation: (
    namespace?: string | string[],
    options?: TranslationOptions
  ) => {
    t: (key: string, options?: TranslationOptions) => string;
    i18n: { language: string; changeLanguage: (language: string) => Promise<void> };
  };
  serverTranslation: (
    namespace?: string | string[],
    options?: TranslationOptions
  ) => Promise<{
    t: (key: string, options?: TranslationOptions) => string;
    i18n: { language: string; changeLanguage: (language: string) => Promise<void> };
  }>;
};

const translationsDir = path.resolve(__dirname, "../i18n/translations");
const namespaceCache = new Map<string, TranslationValues | null>();

const getNamespaceName = (namespace?: string | string[]) => {
  if (Array.isArray(namespace)) {
    return namespace[0] ?? "common";
  }

  return namespace ?? "common";
};

const getCacheKey = (language: string, namespace: string) => `${language}:${namespace}`;

const loadNamespace = (language: string, namespace: string): TranslationValues | null => {
  const cacheKey = getCacheKey(language, namespace);

  if (namespaceCache.has(cacheKey)) {
    return namespaceCache.get(cacheKey) ?? null;
  }

  const filePath = path.join(translationsDir, language, `${namespace}.json`);
  if (!fs.existsSync(filePath)) {
    namespaceCache.set(cacheKey, null);
    return null;
  }

  const parsed = JSON.parse(fs.readFileSync(filePath, "utf8")) as TranslationValues;
  namespaceCache.set(cacheKey, parsed);
  return parsed;
};

const getNestedValue = (resource: TranslationValues, key: string): unknown => {
  return key.split(".").reduce<unknown>((current, part) => {
    if (!current || typeof current !== "object") {
      return undefined;
    }

    return (current as TranslationValues)[part];
  }, resource);
};

const interpolate = (template: string, options?: Record<string, unknown>) => {
  if (!options) {
    return template;
  }

  return template.replace(/{{\s*([^\s}]+)\s*}}/g, (_match, token: string) => {
    const value = options[token];
    return value === undefined || value === null ? `{{${token}}}` : String(value);
  });
};

const translate = (
  language: string,
  namespace: string,
  key: string,
  options?: TranslationOptions
) => {
  const resource = loadNamespace(language, namespace) ?? loadNamespace("en", namespace);
  if (!resource) {
    return key;
  }

  const pluralKey =
    typeof options?.count === "number" ? `${key}_${options.count === 1 ? "one" : "other"}` : null;
  const rawValue =
    (pluralKey ? getNestedValue(resource, pluralKey) : undefined) ?? getNestedValue(resource, key);

  return typeof rawValue === "string" ? interpolate(rawValue, options) : key;
};

export const createTranslationMocks = (): TranslationModule => {
  const buildTranslator = (namespace?: string | string[], options?: TranslationOptions) => {
    const resolvedNamespace = getNamespaceName(namespace);
    const language = options?.lng ?? "en";

    return {
      t: (key: string, translateOptions?: TranslationOptions) =>
        translate(translateOptions?.lng ?? language, resolvedNamespace, key, translateOptions),
      i18n: {
        language,
        changeLanguage: async (_language: string) => undefined,
      },
    };
  };

  return {
    useTranslation: (namespace?: string | string[], options?: TranslationOptions) =>
      buildTranslator(namespace, options),
    serverTranslation: async (namespace?: string | string[], options?: TranslationOptions) =>
      buildTranslator(namespace, options),
  };
};
