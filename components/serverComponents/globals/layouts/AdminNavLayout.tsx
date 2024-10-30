import { LeftNavigation } from "@clientComponents/admin/LeftNav/LeftNavigation";
import { TwoColumnLayout } from "./TwoColumnLayout";
import { FullWidthLayout } from "./FullWidthLayout";

import { authCheckAndRedirect } from "@lib/actions";

// @ts-expect-error fix this
interface AdminNavLayoutProps extends React.PropsWithChildren {
  backLink?: React.ReactElement;
  locale: string;
  hideLeftNav?: boolean | false;
}

interface AdminNavLayoutProps {
  children: object;
}

export const AdminNavLayout = async ({ children, backLink, hideLeftNav }: AdminNavLayoutProps) => {
  await authCheckAndRedirect();
  return (
    <div className={`flex h-full flex-col ${hideLeftNav && "bg-gray-50"}`}>
      {hideLeftNav ? (
        // @ts-expect-error fix this
        <FullWidthLayout context="admin">{children}</FullWidthLayout>
      ) : (
        <TwoColumnLayout
          context="admin"
          leftColumnContent={
            <>
              {backLink}
              <LeftNavigation />
            </>
          }
        >
          {/* @ts-expect-error fix this */}
          {children}
        </TwoColumnLayout>
      )}
    </div>
  );
};
