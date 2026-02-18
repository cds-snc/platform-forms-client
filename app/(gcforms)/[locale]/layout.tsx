import { auth } from "@lib/auth";
import { ClientContexts } from "@clientComponents/globals/ClientContexts";
import { ReactHydrationCheck } from "@clientComponents/globals";
import { NotifyCatcher } from "@lib/notifyCatcher/NotifyCatcher";
import { checkAll } from "@lib/cache/flags";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const featureFlags = await checkAll();

  return (
    <>
      <ReactHydrationCheck />
      <ClientContexts session={session} featureFlags={featureFlags}>
        {children}
      </ClientContexts>
      {process.env.APP_ENV === "local" && <NotifyCatcher />}
    </>
  );
}
