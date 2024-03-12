import { isEmailDelivery } from "@lib/utils/form-builder";
import { getAppSetting } from "@lib/appSettings";
import { auth } from "@lib/auth";
import { ucfirst } from "@lib/client/clientHelpers";
import { DeliveryOptionEmail } from "./components/DeliveryOptionEmail";
import { NavigationTabs } from "./components/NavigationTabs";
import { TitleAndDescription } from "./components/TitleAndDescription";
import { fetchSubmissions, fetchTemplate } from "./actions";
import { LoggedOutTab, LoggedOutTabName } from "@serverComponents/form-builder/LoggedOutTab";

export default async function Layout({
  children,
  params: { locale, statusFilter, id },
}: {
  children: React.ReactNode;
  params: { locale: string; statusFilter: string; id: string };
}) {
  const session = await auth();
  const isAuthenticated = session !== null;

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl">
        <LoggedOutTab tabName={LoggedOutTabName.RESPONSES} />
      </div>
    );
  }

  const initialForm = await fetchTemplate(id);
  const responseDownloadLimit = Number(await getAppSetting("responseDownloadLimit"));
  const deliveryOption = initialForm?.deliveryOption;
  const isPublished = initialForm?.isPublished || false;

  const { submissions } = await fetchSubmissions({
    formId: id,
    status: statusFilter,
  });

  if (deliveryOption && isEmailDelivery(deliveryOption)) {
    return (
      <DeliveryOptionEmail
        email={deliveryOption.emailAddress}
        emailSubject={{
          en: deliveryOption.emailSubjectEn || "",
          fr: deliveryOption.emailSubjectfr || "",
        }}
        isPublished={isPublished}
        formId={id}
      />
    );
  }

  return (
    <>
      <NavigationTabs statusFilter={statusFilter} formId={id} locale={locale} />
      {isAuthenticated && submissions.length > 0 && (
        <TitleAndDescription
          statusFilter={ucfirst(statusFilter)}
          formId={id}
          responseDownloadLimit={responseDownloadLimit}
        />
      )}
      {children}
    </>
  );
}
