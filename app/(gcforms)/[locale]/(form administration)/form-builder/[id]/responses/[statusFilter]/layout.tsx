import { createAbility } from "@lib/privileges";
import { DeliveryOptionEmail } from "./components/DeliveryOptionEmail";
import { NavigationTabs } from "./components/NavigationTabs";
import { isEmailDelivery } from "@clientComponents/form-builder/util";
import { getFullTemplateByID } from "@lib/templates";
import { auth } from "@lib/auth";

export default async function Layout({
  children,
  params: { locale, statusFilter, id },
}: {
  children: React.ReactNode;
  params: { locale: string; statusFilter: string; id: string };
}) {
  const session = await auth();
  const ability = session && createAbility(session);
  const initialForm = ability && (await getFullTemplateByID(ability, id));

  const deliveryOption = initialForm?.deliveryOption;
  const isPublished = initialForm?.isPublished || false;

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
      {children}
    </>
  );
}
