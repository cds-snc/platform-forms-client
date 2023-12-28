import { redirect } from "next/navigation";
import { getAppSession } from "@app/api/auth/authConfig";
import { ClientContexts } from "@clientComponents/globals/ClientContexts";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await getAppSession();
  if (session) {
    if (!session.user.acceptableUse) {
      // If they haven't agreed to Acceptable Use redirect to policy page for acceptance

      redirect(`/auth/policy`);
    }

    if (!session.user.hasSecurityQuestions) {
      // If they haven't setup security questions Use redirect to policy page for acceptance
      redirect(`/auth/setup-security-questions`);
    }
  }

  return <ClientContexts session={session}>{children}</ClientContexts>;
}
