import { Start } from "@clientComponents/form-builder/app/Start";
import { serverTranslation } from "@app/i18n";
import { Metadata } from "next";
import { TemplateStoreProvider } from "@clientComponents/form-builder/store/useTemplateStore";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await serverTranslation(["common", "form-builder", "form-closed"]);
  return {
    title: `${t("gcFormsStart")} — ${t("gcForms")}`,
  };
}

export default async function Page() {
  const css = `
  body {
     background-color: #F9FAFB;
  }
`;

  return (
    <TemplateStoreProvider>
      <style>{css}</style>
      <Start />
    </TemplateStoreProvider>
  );
}
