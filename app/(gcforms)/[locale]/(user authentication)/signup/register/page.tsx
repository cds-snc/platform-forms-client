import { serverTranslation } from "@i18n";
import UserNavLayout from "@clientComponents/globals/layouts/UserNavLayout";
import { Metadata } from "next";
import { getAppSession } from "@api/auth/authConfig";
import { redirect } from "next/navigation";
import { Register } from "./clientSide";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { t } = await serverTranslation("signup", { lang: locale });
  return {
    title: t("signUpRegistration.title"),
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const session = await getAppSession();

  if (session) redirect(`/${locale}/forms/`);

  return (
    <UserNavLayout contentWidth="tablet:w-[658px]">
      <Register />
    </UserNavLayout>
  );
}
