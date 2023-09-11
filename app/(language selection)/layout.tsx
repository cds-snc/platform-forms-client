import Footer from "@appComponents/globals/Footer";
import SkipLink from "@appComponents/globals/SkipLink";

export default async function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full flex-col">
      <SkipLink />

      {children}
      <Footer />
    </div>
  );
}
