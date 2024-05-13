import PropTypes from "prop-types";
import { LeftNavigation } from "@clientComponents/admin/LeftNav/LeftNavigation";
import { TwoColumnLayout } from "./TwoColumnLayout";
import { FullWidthLayout } from "./FullWidthLayout";
import { redirect } from "next/navigation";
import { authCheck } from "@lib/actions";

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
  await authCheck().catch(() => {
    redirect(`/${locale}/auth/login`);
  });
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
