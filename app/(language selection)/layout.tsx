import { Footer, SkipLink } from "@serverComponents/globals";

export default async function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full flex-col">
      <SkipLink />

      {children}
      <Footer isSplashPage={true} />
    </div>
  );
}
