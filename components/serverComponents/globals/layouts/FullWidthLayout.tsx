import { ToastContainer } from "app/(gcforms)/[locale]/(form administration)/form-builder/components/shared/Toast";
import { Header } from "@clientComponents/globals/Header/Header";
import { Footer, SkipLink } from "@clientComponents/globals";

export const FullWidthLayout = ({
  children,
  user,
  context,
}: {
  children: React.ReactNode;
  user?: { name: string | null; email: string };
  context?: "admin" | "formBuilder" | "default";
}) => {
  // Wait until the Template Store has fully hydrated before rendering the page
  return (
    <>
      <div className="flex h-full flex-col">
        <SkipLink />

        <Header context={context} user={user} />
        <div className="mx-4 shrink-0 grow basis-auto laptop:mx-32 desktop:mx-64">
          <ToastContainer />
          <>
            <div>
              <main id="content">{children}</main>
            </div>
          </>
        </div>
        <Footer displayFormBuilderFooter />
      </div>
    </>
  );
};
