import { serverTranslation } from "@i18n";

const steps = {
  "load-key": { current: 1, total: 3 },
  location: { current: 2, total: 3 },
  format: { current: 3, total: 3 },
};

export function getStepOf(step: keyof typeof steps) {
  return steps[step];
}
export async function getPageTitle({
  step,
  props,
}: {
  step?: keyof typeof steps;
  props: Promise<{ locale: string }>;
}): Promise<{ title: string }> {
  const params = await props;
  const { locale } = params;
  const { t } = await serverTranslation("response-api", { lang: locale });

  if (!step || !steps[step]) {
    return {
      title: `${t("section-title")}`,
    };
  }

  const { current, total } = getStepOf(step);
  const title = `${t("section-title")} — ${t("stepOf", { current, total })}`;

  return {
    title,
  };
}
