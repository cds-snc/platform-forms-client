import { isEmailDelivery } from "@clientComponents/form-builder/util";
import { getAppSetting } from "@lib/appSettings";
import { auth } from "@lib/auth";
import { ucfirst } from "@lib/client/clientHelpers";
import { DeliveryOptionEmail } from "./components/DeliveryOptionEmail";
import { NavigationTabs } from "./components/NavigationTabs";
import { TitleAndDescription } from "./components/TitleAndDescription";
import { fetchSubmissions, fetchTemplate } from "./utils";

export default async function Layout({
  children,
  params: { locale, statusFilter, id },
}: {
  children: React.ReactNode;
  params: { locale: string; statusFilter: string; id: string };
}) {
  const initialForm = await fetchTemplate(id);
  const session = await auth();
  const isAuthenticated = session !== null;
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
