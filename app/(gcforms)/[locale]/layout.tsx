import { authCheckAndThrow } from "@lib/actions";
import { ClientContexts } from "@clientComponents/globals/ClientContexts";
import { ReactHydrationCheck } from "@clientComponents/globals";
import { NotifyCatcher } from "@lib/notifyCatcher/NotifyCatcher";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const { session } = await authCheckAndThrow().catch(() => ({ session: null }));
  return (
    <>
      <ReactHydrationCheck />
      <ClientContexts session={session}>{children}</ClientContexts>
      {process.env.APP_ENV === "local" && <NotifyCatcher />}
    </>
  );
}
