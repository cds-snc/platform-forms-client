import { Metadata } from "next";
import { SelectApiKey } from "./SelectApiKey";
import { getPageTitle } from "../lib/getStepOf";

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const metadata = await getPageTitle({ step: "load-key", props: props.params });
  return metadata;
}

export default async function Page(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string; id: string }>;
}) {
  const params = await props.params;

  const { locale, id } = params;
  return <SelectApiKey locale={locale} id={id} />;
}
