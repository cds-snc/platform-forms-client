import { languages } from "@root/i18n/settings";
import { getWPPage } from "@lib/cms";
import { CMSBoundary } from "@serverComponents/globals/ShadowBoundary";

// Next.js will invalidate the cache when a
// request comes in, at most once every 5 minutes.
export const revalidate = 300;

export async function generateStaticParams() {
  return languages.map((locale) => ({
    locale,
  }));
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const page = await getWPPage("home", locale);
  return (
    <CMSBoundary>
      <div>
        <h1 dangerouslySetInnerHTML={{ __html: page.title.rendered }} />
        <div dangerouslySetInnerHTML={{ __html: page.content.rendered }} />
      </div>
    </CMSBoundary>
  );
}
