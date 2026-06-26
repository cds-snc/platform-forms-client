import { Footer } from "@root/components/serverComponents/globals/Footer";
import { SkipLink } from "@clientComponents/globals/SkipLink";

export default async function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full flex-col">
      <SkipLink />

      {children}
      <Footer isSplashPage={true} />
    </div>
  );
}
