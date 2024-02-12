import { FormBuilderInitializer } from "@clientComponents/globals/layouts/FormBuilderLayout";
import { TwoColumnLayout } from "@clientComponents/globals/layouts/TwoColumnLayout";
import { LeftNavigation } from "@clientComponents/form-builder/app";

export default async function Layout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  return (
    <FormBuilderInitializer locale={locale}>
      <TwoColumnLayout context="formBuilder" leftColumnContent={<LeftNavigation />}>
        {children}
      </TwoColumnLayout>
    </FormBuilderInitializer>
  );
}
