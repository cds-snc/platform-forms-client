import { authCheckAndThrow } from "@lib/actions";
import { LeftNavigation } from "./components/LeftNavigation";
import { ToastContainer } from "@formBuilder/components/shared/Toast";
import { Footer } from "@serverComponents/globals/Footer";
import { Header } from "@clientComponents/globals/Header/Header";
import { AccessControlError } from "@lib/auth/errors";
import { getTemplateWithAssociatedUsers } from "@lib/templates";
import { redirect } from "next/navigation";
import { SaveTemplateProvider } from "@lib/hooks/form-builder/useTemplateContext";
import { RefStoreProvider } from "@lib/hooks/form-builder/useRefStore";
import { RightPanel } from "@formBuilder/components/shared/right-panel/RightPanel";
import { allowGrouping } from "@root/lib/groups/utils/allowGrouping";
import { GroupStoreProvider } from "@lib/groups/useGroupStore";
import { TemplateStoreProvider } from "@lib/store/useTemplateStore";
import { Language } from "@lib/types/form-builder-types";
import { FormRecord } from "@lib/types";
import { logMessage } from "@lib/logger";
import { authorization } from "@lib/privileges";
import { checkKeyExists } from "@lib/serviceAccount";
import { allowLockedEditing } from "@lib/utils/form-builder/allowLockedEditing";
import { getAppSetting } from "@lib/appSettings";
import { normalizeEditLockRedirectIdleMs } from "@lib/utils/form-builder/editLockRedirectIdleMs";
import { shouldEnforceTemplateEditLockWithVerifiedUserCount } from "@lib/editLocks";
import {
  FormBuilderConfigProvider,
  FormBuilderConfig,
  formBuilderConfigDefault,
} from "@lib/hooks/useFormBuilderConfig";
import { EditLockClient } from "@formBuilder/components/shared/edit-lock/EditLockClient";
import { EditLockProvider } from "@formBuilder/components/shared/edit-lock/EditLockContext";
import { AccountMenu } from "@formBuilder/components/shared/account-menu/AccountMenu";
import { ManageFormAccessDialogContainer } from "./components/dialogs/ManageFormAccessDialog";

export default async function Layout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string; id: string }>;
}) {
  const params = await props.params;

  const { locale, id } = params;

  const { children } = props;

  let initialForm: FormRecord | null = null;

  const { session } = await authCheckAndThrow().catch(() => ({
    session: null,
    ability: null,
  }));

  const formID = id || null;

  const allowGroupsFlag = allowGrouping();
  const allowLockedEditingFlag = await allowLockedEditing(session?.user.id);
  const shareUsesManageAccess = allowLockedEditingFlag && formID !== "0000";
  const publishFormsEnabled = session
    ? await authorization.hasPublishFormsPrivilege().catch(() => false)
    : false;
  const ownerIdleTimeoutMs = normalizeEditLockRedirectIdleMs(
    await getAppSetting("editLockRedirectIdleMs")
  );

  if (session && formID && formID !== "0000") {
    const templateWithUsers = await getTemplateWithAssociatedUsers(formID).catch((e) => {
      if (e instanceof AccessControlError) {
        redirect(`/${locale}/admin/unauthorized`);
      }
      logMessage.warn(`Error fetching Form Record for form-builder/[id] Layout: ${e.message}`);
      return null;
    });

    initialForm = templateWithUsers?.formRecord ?? null;

    if (initialForm === null) {
      redirect(`/${locale}/404`);
    }
  }

  const enforceEditLockFlag =
    initialForm !== null && formID !== null
      ? await shouldEnforceTemplateEditLockWithVerifiedUserCount(formID, session?.user.id)
      : false;

  let apiKeyId: string | undefined = undefined;

  try {
    // No need to fetch in test, it will always not exist
    if (formID) {
      apiKeyId =
        process.env.APP_ENV === "test" || formID === "0000"
          ? undefined
          : await checkKeyExists(formID);
    }
  } catch (e) {
    // no-op
  }

  const formBuilderConfig: FormBuilderConfig = {
    ...formBuilderConfigDefault,
    ...{ apiKeyId: apiKeyId || false },
  };

  return (
    <FormBuilderConfigProvider formBuilderConfig={formBuilderConfig}>
      <TemplateStoreProvider {...{ ...initialForm, locale, allowGroupsFlag }}>
        <SaveTemplateProvider>
          <RefStoreProvider>
            <EditLockProvider
              formId={id}
              lockedEditingEnabled={enforceEditLockFlag}
              ownerIdleTimeoutMs={ownerIdleTimeoutMs}
            >
              <GroupStoreProvider>
                <ManageFormAccessDialogContainer formId={id} />
                <div className="h-full">
                  <div className="flex min-h-screen flex-col">
                    <Header
                      context="formBuilder"
                      className="mb-0"
                      shareUsesManageAccess={shareUsesManageAccess}
                    />
                    <div className="bg-gray-soft flex shrink-0 grow basis-auto flex-col">
                      <ToastContainer containerId="default" />
                      <ToastContainer
                        limit={1}
                        containerId="wide"
                        autoClose={10000}
                        ariaLabel="Notifications: Alt+T"
                        width="600px"
                      />
                      <ToastContainer
                        containerId="error-persistent"
                        autoClose={false}
                        ariaLabel="Error notifications"
                        width="600px"
                      />
                      <div className="flex grow flex-row gap-7">
                        <div id="left-nav" className="z-10 border-r border-slate-200 bg-white">
                          <div className={"sticky top-0 flex h-full min-h-0 flex-col"}>
                            <div className="min-h-0 flex-1 overflow-y-auto">
                              <LeftNavigation id={id} />
                            </div>
                            {session && (
                              <AccountMenu
                                locale={locale}
                                testId="account-menu-trigger"
                                publishingEnabled={publishFormsEnabled}
                              />
                            )}
                          </div>
                        </div>
                        <div className="relative flex w-full gap-7">
                          <EditLockClient formId={id}>
                            <main
                              id="content"
                              className="form-builder my-7 min-h-[calc(100vh-300px)] w-full"
                              tabIndex={-1}
                            >
                              {children}
                            </main>
                            {allowGroupsFlag && <RightPanel id={id} lang={locale as Language} />}
                          </EditLockClient>
                        </div>
                      </div>
                    </div>
                    <Footer displayFormBuilderFooter className="mt-0 lg:mt-0" />
                  </div>
                </div>
              </GroupStoreProvider>
            </EditLockProvider>
          </RefStoreProvider>
        </SaveTemplateProvider>
      </TemplateStoreProvider>
    </FormBuilderConfigProvider>
  );
}
