import { Metadata } from "next";
import { serverTranslation } from "@i18n";
import { Session } from "next-auth";

import { checkIfClosed } from "@lib/templates";
import { authorization } from "@lib/privileges";
import { AuthenticatedPage } from "@lib/pages/auth";
import { SetClosingDate } from "./components/close/SetClosingDate";
import { Notifications } from "./components/notifications/Notifications";
import {
  getNotificationsUsersForForm,
  getUserNotificationSettingsForForm,
} from "@root/lib/notifications";

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const params = await props.params;

  const { locale } = params;

  const { t } = await serverTranslation("form-builder", { lang: locale });

  return {
    title: `${t("settings.formManagement")} — ${t("gcForms")}`,
  };
}

export default AuthenticatedPage(
  async (props: {
    params: Promise<{ id: string; locale: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
    session: Session;
  }) => {
    const { id } = await props.params;

    let closedDetails;

    const canSetClosingDate =
      id !== "0000" ||
      (await authorization
        .canEditForm(id)
        .then(() => true)
        .catch(() => false));

    if (canSetClosingDate) {
      const closedData = await checkIfClosed(id);
      closedDetails = closedData?.closedDetails;
    }

    // Get logged in user's notification setting for this form
    const loggedInUserNotificationsSetting = await getUserNotificationSettingsForForm(
      id,
      props.session.user.id
    );

    // Get list of users and their notification settings for this form
    const userNotificationsForForm = await getNotificationsUsersForForm(id);

    // Is the currently logged in user assigned to this form
    const userIsNotifiable = userNotificationsForForm
      ? userNotificationsForForm.some((user) => user.id === props.session.user.id)
      : false;

    // Remove logged in user from list for display
    // const filteredUserNotifications = userNotificationsForForm
    //   ? userNotificationsForForm.filter((user) => user.id !== props.session.user.id)
    //   : null;

    return (
      <>
        {canSetClosingDate && <SetClosingDate formId={id} closedDetails={closedDetails} />}
        <Notifications
          formId={id}
          userIsNotifiable={userIsNotifiable}
          userHasNotificationsEnabled={loggedInUserNotificationsSetting}
          userNotificationsForForm={userNotificationsForForm}
          loggedInUser={props.session.user}
        />
      </>
    );
  }
);
