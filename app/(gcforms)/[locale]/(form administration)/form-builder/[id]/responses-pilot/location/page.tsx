import { Metadata } from "next";
import { SelectLocation } from "./SelectLocation";
import { ApiClientGuard } from "../guards/ApiClientGuard";
import { getPageTitle } from "../lib/getStepOf";

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const metadata = await getPageTitle({ step: "location", props: props.params });
  return metadata;
}

export default async function Page(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string; id: string }>;
}) {
  const params = await props.params;
  const { locale, id } = params;
  return (
    <ApiClientGuard>
      <SelectLocation locale={locale} id={id} />
    </ApiClientGuard>
  );
}
