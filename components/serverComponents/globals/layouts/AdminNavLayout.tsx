import PropTypes from "prop-types";
import { LeftNavigation } from "@clientComponents/admin/LeftNav/LeftNavigation";
import { TwoColumnLayout } from "./TwoColumnLayout";
import { FullWidthLayout } from "./FullWidthLayout";
import { auth } from "@lib/auth";
import { redirect } from "next/navigation";

interface AdminNavLayoutProps extends React.PropsWithChildren {
  backLink?: React.ReactElement;
  locale: string;
  hideLeftNav?: boolean | false;
}

export const AdminNavLayout = async ({
  children,
  backLink,
  hideLeftNav,
  locale,
}: AdminNavLayoutProps) => {
  const session = await auth();
  if (!session) {
    redirect(`/${locale}/auth/login`);
  }
  return (
    <div className={`flex h-full flex-col ${hideLeftNav && "bg-gray-50"}`}>
      {hideLeftNav ? (
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
          {children}
        </TwoColumnLayout>
      )}
    </div>
  );
};

AdminNavLayout.propTypes = {
  children: PropTypes.object.isRequired,
};
