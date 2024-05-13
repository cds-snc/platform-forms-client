import { authCheck } from "@lib/actions";
import { ClientContexts } from "@clientComponents/globals/ClientContexts";
import { ReactHydrationCheck } from "@clientComponents/globals";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const { session } = await authCheck().catch(() => ({ session: null }));
  return (
    <>
      <ReactHydrationCheck />
      <ClientContexts session={session}>{children}</ClientContexts>;
    </>
  );
}
