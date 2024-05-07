import { isEmailDelivery } from "@lib/utils/form-builder";
import { auth } from "@lib/auth";
import { DeliveryOptionEmail } from "./components/DeliveryOptionEmail";
import { NavigationTabs } from "./components/NavigationTabs";
import { fetchTemplate } from "./actions";
import { LoggedOutTab, LoggedOutTabName } from "@serverComponents/form-builder/LoggedOutTab";
import { ResponsesFooter } from "./components/ResponsesFooter";

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
  const deliveryOption = initialForm?.deliveryOption;
  const isPublished = initialForm?.isPublished || false;

  if (deliveryOption && isEmailDelivery(deliveryOption)) {
    return (
      <DeliveryOptionEmail
        email={deliveryOption.emailAddress}
        emailSubject={{
          en: deliveryOption.emailSubjectEn || "",
          fr: deliveryOption.emailSubjectFr || "",
        }}
        isPublished={isPublished}
        formId={id}
      />
    );
  }

  return (
    <div className="mr-10">
      <NavigationTabs statusFilter={statusFilter} formId={id} locale={locale} />
      {children}
      <ResponsesFooter formId={id} />
    </div>
  );
}
