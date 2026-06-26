"use client";

/*--------------------------------------------*
 * Internal Aliases
 *--------------------------------------------*/
import { useTranslation } from "./client";
export function I18n({
  i18nKey,
  namespace,
  data,
  tagName: Tag = "span",
  ...props
}: {
  i18nKey: string;
  children?: React.ReactNode;
  namespace?: string;
  data?: Record<string, unknown>;
  tagName?: "span" | "p" | "div";
} & React.HTMLAttributes<HTMLElement>) {
  const { t } = useTranslation(namespace);
  const helperKey = `${namespace ? `${namespace}.` : ""}${i18nKey}`;

  return (
    <Tag data-i18n-key={helperKey} {...props}>
      {t(i18nKey, data) as string}
    </Tag>
  );
}
