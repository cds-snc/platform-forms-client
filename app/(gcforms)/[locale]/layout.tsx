import { redirect } from "next/navigation";
import { auth } from "@lib/auth";
import { ClientContexts } from "@clientComponents/globals/ClientContexts";
import { headers } from "next/headers";
import { localPathRegEx } from "@lib/auth/auth";

export default async function Layout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const session = await auth();

  const headersList = headers();
  const currentPath = headersList.get("x-path")?.replace(`/${locale}`, "");

  if (session && currentPath) {
    if (
      !session.user.hasSecurityQuestions &&
      !currentPath.startsWith("/auth/setup-security-questions") &&
      // Let them access support related pages if having issues with Security Questions
      !currentPath.startsWith("/form-builder/support") &&
      !currentPath.startsWith("/sla") &&
      !currentPath.startsWith("/terms-of-use")
    ) {
      // check if user has setup security questions setup
      redirect(`/${locale}/auth/setup-security-questions`);
    }
    // Redirect to policy page only if users aren't on the policy or security questions page
    if (
      session.user.hasSecurityQuestions &&
      !session.user.acceptableUse &&
      !currentPath.startsWith("/auth/policy") &&
      !currentPath.startsWith("/auth/setup-security-questions") &&
      // If they don't want to accept let them log out
      !currentPath.startsWith("/auth/logout")
    ) {
      // If they haven't agreed to Acceptable Use redirect to policy page for acceptance
      // If already on the policy page don't redirect, aka endless redirect loop.
      // Also check that the path is local and not an external URL
      redirect(
        `/${locale}/auth/policy?referer=/${locale}${
          localPathRegEx.test(currentPath) ? currentPath : "/forms"
        }`
      );
    }
  }

  return <ClientContexts session={session}>{children}</ClientContexts>;
}
