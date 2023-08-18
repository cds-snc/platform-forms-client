import { serverTranslation } from "@i18n";
import Link from "next/link";

const Home = async ({ params: { lang } }: { params: { lang: string } }) => {
  const { t: tBroswerLang } = await serverTranslation(lang, ["common"]);
  const { t: tSecondLang } = await serverTranslation(lang !== "fr" ? "fr" : "en", ["common"]);
  return (
    <div className="flex flex-col h-full">
      <div id="page-container">
        <main id="content">
          <div>
            <h1>
              <span lang="en">{tBroswerLang("title")}</span> -{" "}
              <span lang="fr">{tSecondLang("title")}</span>
            </h1>
          </div>
          <div className="border-gray-400 p-10 grid grid-cols-2 gap-x-4 max-w-2xl  w-2/4 m-auto">
            <p>
              <Link href={`/${lang === "en" ? "en" : "fr"}/form-builder`} lang="en" locale={false}>
                {lang === "en" ? "English" : "Français"}
              </Link>
            </p>

            <p>
              <Link
                href={`/${lang === "en" ? "fr" : "en"}/form-builder`}
                className="block"
                lang="fr"
                locale={false}
              >
                {lang === "en" ? "Français" : "English"}
              </Link>
            </p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Home;
