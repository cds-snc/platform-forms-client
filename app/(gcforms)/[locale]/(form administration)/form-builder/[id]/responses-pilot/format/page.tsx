import { Metadata } from "next";
import { SelectFormat } from "./SelectFormat";
import { ApiClientGuard } from "../guards/ApiClientGuard";
import { LocationGuard } from "../guards/LocationGuard";
import { getPageTitle } from "../lib/getStepOf";

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const metadata = await getPageTitle({ step: "format", props: props.params });
  return metadata;
}

export default async function Page(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string; id: string }>;
}) {
  const params = await props.params;

  const { locale, id } = params;
  return (
    <div>
      <ApiClientGuard>
        <LocationGuard>
          <SelectFormat locale={locale} id={id} />
        </LocationGuard>
      </ApiClientGuard>
    </div>
  );
}
