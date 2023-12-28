import { FormBuilderLayout } from "@clientComponents/globals/layouts/FormBuilderLayout";

export default async function Layout({ children }: { children: React.ReactNode }) {
  return <FormBuilderLayout page={<>{children}</>} />;
}
