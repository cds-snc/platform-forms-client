import { auth } from "@lib/auth";
import { ClientContexts } from "@clientComponents/globals/ClientContexts";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  return <ClientContexts session={session}>{children}</ClientContexts>;
}
