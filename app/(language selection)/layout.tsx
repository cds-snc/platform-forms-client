import { Footer, SkipLink } from "@serverComponents/globals";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const css = `
    body {
       background-color: #F9FAFB;
    }
`;
  return (
    <div className="flex h-full flex-col">
      <style>{css}</style>
      <SkipLink />

      {children}
      <Footer isSplashPage={true} />
    </div>
  );
}
