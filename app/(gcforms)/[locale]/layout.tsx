import { auth } from "@lib/auth";
import { ClientContexts } from "@clientComponents/globals/ClientContexts";
import { ReactHydrationCheck } from "@clientComponents/globals";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  return (
    <>
      <ReactHydrationCheck />
      <ClientContexts session={session}>{children}</ClientContexts>
    </>
  );
}
