import { serverTranslation } from "@i18n";
import { Metadata } from "next";
import {
  requireAuthentication,
  retrievePoolOfSecurityQuestions,
  retrieveUserSecurityQuestions,
} from "@lib/auth";
import { checkPrivilegesAsBoolean } from "@lib/privileges";
import { Profile } from "./clientSide";
import { cn } from "@lib/utils";
import { Header } from "@clientComponents/globals/Header/Header";
import { SkipLink } from "@clientComponents/globals/SkipLink";
import { Footer } from "@clientComponents/globals/Footer";
import { TemplateStoreProvider } from "@lib/store/useTemplateStore";
import { SaveTemplateProvider } from "@lib/hooks/form-builder/useTemplateContext";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { t } = await serverTranslation("profile", { lang: locale });
  return {
    title: t("title"),
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const { user } = await requireAuthentication();
  checkPrivilegesAsBoolean(user.ability, [{ action: "view", subject: "FormRecord" }], {
    redirect: true,
  });

  const publishingStatus = checkPrivilegesAsBoolean(user.ability, [
    { action: "update", subject: "FormRecord", field: "isPublished" },
  ]);

  const [userQuestions, allQuestions] = await Promise.all([
    retrieveUserSecurityQuestions({ userId: user.ability.userID }),
    retrievePoolOfSecurityQuestions(),
  ]);

  return (
    <TemplateStoreProvider {...{ locale }}>
      <SaveTemplateProvider>
        <div className="flex h-full flex-col bg-gray-soft">
          <SkipLink />
          <Header className="mb-0" />
          <div className="shrink-0 grow basis-auto">
            <div className="flex flex-row gap-10">
              <main id="content" className={cn("w-full form-builder mt-5 mb-10 mx-60")}>
                <Profile
                  email={user.email}
                  {...{ publishingStatus, userQuestions, allQuestions }}
                />
              </main>
            </div>
          </div>
          <Footer displayFormBuilderFooter className="mt-0 lg:mt-0" />
        </div>
      </SaveTemplateProvider>
    </TemplateStoreProvider>
  );
}
