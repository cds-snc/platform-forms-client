import { redirect } from "next/navigation";

export default async function Page(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  const { locale } = params;
  const callbackUrl = encodeURIComponent(`/${locale}/auth/policy`);
  redirect(`/api/auth/signin/gcForms?callbackUrl=${callbackUrl}`);
}
