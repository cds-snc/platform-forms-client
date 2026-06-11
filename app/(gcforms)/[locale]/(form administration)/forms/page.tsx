import { serverTranslation } from "@i18n";
import { Metadata } from "next";
import { authCheckAndRedirect } from "@lib/actions";
import { AccessControlError } from "@lib/auth/errors";
import { redirect } from "next/navigation";
import { Navigation } from "./components/server/Navigation";
import { Cards } from "./components/server/Cards";
import { NewFormButton } from "./components/server/NewFormButton";
import { ResumeEditingForm } from "./components/ResumeEditingForm";
import { getAllTemplatesForUser, TemplateOptions } from "@lib/templates";
import { DeliveryOption } from "@lib/types";
import { getOverdueTemplateIds } from "@lib/overdue";
import { Invitations } from "./components/Invitations/Invitations";
import { prisma } from "@gcforms/database";
<<<<<<< HEAD

const FALLBACK_DATE = Date.now().toString();

export type FormsTemplate = {
  id: string;
  titleEn: string;
  titleFr: string;
  deliveryOption: DeliveryOption;
  name: string;
  isPublished: boolean;
  ttl: Date | null;
  date: string;
  url: string;
  overdue: boolean;
  hasDraft: boolean;
  versionNumber?: number | null;
=======
import { getTemplateIdsWithEditLocks, getEditLockInfoWithCollaborators } from "@lib/editLockUtils";
import { EDIT_LOCK_POLL_INTERVAL_MS } from "./components/constants";
import { CoEditingHelp } from "./components/server/CoEditingHelp";
import type { FormsTemplate, FormsTemplateWithLockInfo, FormTabStatus } from "./components/types";
import { TAB_STATUS } from "./components/types";

const getStatusTitle = (status: FormTabStatus | undefined, t: (key: string) => string): string => {
  const defaultStatus = t("nav.recentlyEdited");
  const statusTitleMap: Record<string, string> = {
    [TAB_STATUS.DRAFT]: t("nav.drafts"),
    [TAB_STATUS.PUBLISHED]: t("nav.published"),
    [TAB_STATUS.ARCHIVED]: t("nav.archived"),
    [TAB_STATUS.RECENTLY_EDITED]: t("nav.recentlyEdited"),
  };
  return status ? statusTitleMap[status] : defaultStatus;
>>>>>>> c586e2491e1742be824d9148801aeef5c47f7e37
};

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
<<<<<<< HEAD
=======
  searchParams: Promise<{ status: FormTabStatus }>;
>>>>>>> c586e2491e1742be824d9148801aeef5c47f7e37
}): Promise<Metadata> {
  const params = await props.params;

  const { locale } = params;
<<<<<<< HEAD

=======
  const { status = TAB_STATUS.RECENTLY_EDITED } = searchParams;
>>>>>>> c586e2491e1742be824d9148801aeef5c47f7e37
  const { t } = await serverTranslation("my-forms", { lang: locale });
  return {
    title: t("title"),
  };
}

export default async function Page(props: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ status: FormTabStatus }>;
}) {
  const searchParams = await props.searchParams;

  const { status = TAB_STATUS.RECENTLY_EDITED } = searchParams;

  const params = await props.params;

  const { locale } = params;

  let session;
  try {
    const result = await authCheckAndRedirect();
    session = result.session;
  } catch (e) {
    if (e instanceof AccessControlError) {
      redirect(`/${locale}/admin/unauthorized`);
    }
    throw e;
  }

  const { t } = await serverTranslation("my-forms", { lang: locale });

  // Moved from Cards to Page to avoid component being cached when navigating back to this page
  const options: TemplateOptions = {
    requestedWhere: {
      isPublished:
        status === TAB_STATUS.PUBLISHED ? true : status === TAB_STATUS.DRAFT ? false : undefined,
      ttl: status === TAB_STATUS.ARCHIVED ? { not: null } : null,
    },
    sortByDateUpdated: "desc",
  };
  const templates = (await getAllTemplatesForUser(options)).map((template) => {
    const {
      id,
      form: { titleEn = "", titleFr = "" },
      name,
      deliveryOption = { emailAddress: "" },
      isPublished,
      updatedAt,
      ttl,
      currentDraftVersionId,
      versionNumber,
    } = template;
    return {
      id,
      titleEn,
      titleFr,
      deliveryOption,
      name,
      isPublished,
      date: updatedAt ?? FALLBACK_DATE,
      url: `/${locale}/id/${id}`,
      overdue: false,
      ttl: ttl ? new Date(ttl) : null,
      hasDraft: currentDraftVersionId && isPublished ? true : false,
      versionNumber,
    };
  });

<<<<<<< HEAD
=======
  const templatesWithEditLocks = await combineTemplatesWithLockInfo(templates);

  // Filter templates based on status
  // For "recentlyEdited", show the 4 most recently updated templates
  const filteredTemplates =
    status === TAB_STATUS.RECENTLY_EDITED || !status
      ? templatesWithEditLocks.slice(0, 4)
      : templatesWithEditLocks;

>>>>>>> c586e2491e1742be824d9148801aeef5c47f7e37
  const invitations = await prisma.invitation.findMany({
    where: {
      email: {
        equals: session.user.email,
        mode: "insensitive",
      },
      expires: {
        gt: new Date(),
      },
      template: {
        ttl: null,
      },
    },
    select: {
      id: true,
      email: true,
      expires: true,
      templateId: true,
    },
  });

  const overdueTemplateIds = await getOverdueTemplateIds(templates.map((template) => template.id));

  return (
<<<<<<< HEAD
    <div className="mx-auto w-[980px]">
      <h1 className="mb-8 border-b-0">{t("title")}</h1>
      <Invitations invitations={invitations} />
      <div className="flex w-full justify-between">
        <Navigation filter={status} />
        <NewFormButton />
      </div>
      <ResumeEditingForm />
      {status == "archived" && (
        <div>
          {t("archivedNotice")}&nbsp;
          <strong>{t("archivedNotice2")}</strong>
        </div>
      )}
      <Cards templates={templates} overdueTemplateIds={overdueTemplateIds} status={status} />
=======
    <div className="m-4 grid min-h-screen grid-cols-[20em_1fr] gap-8">
      <h1 className="sr-only">{`${getStatusTitle(status, t)} - ${t("title")}`}</h1>
      <div>
        <div className="self-start rounded border border-slate-200 bg-white p-2">
          <AccountDetails
            name={session.user.name}
            email={session.user.email}
            accountUrl={session.user.accountUrl}
            isZitadelLoginEnabled={session.user.accountUrl ? true : false}
            profileUrl={`/${locale}/profile`}
            locale={locale}
          />
          <Navigation filter={status} />
        </div>
        <div className="mt-6 ml-2">
          {status == TAB_STATUS.DRAFT && <ResumeEditingForm />}
          <CoEditingHelp />
        </div>
      </div>
      <div className="flex h-full min-h-0 flex-col">
        <div className="">
          <Invitations invitations={invitations} />
          {status == TAB_STATUS.ARCHIVED && (
            <div className="mb-4">
              <div>
                {t("archivedNotice")}&nbsp;
                <strong>{t("archivedNotice2")}</strong>
              </div>
            </div>
          )}
        </div>
        <Cards
          // tell react the state resets when tabs change
          key={status || "default"}
          tabStatus={status}
          initialTemplates={filteredTemplates}
          overdueTemplateIds={overdueTemplateIds}
          pollIntervalMs={EDIT_LOCK_POLL_INTERVAL_MS}
        />
      </div>
>>>>>>> c586e2491e1742be824d9148801aeef5c47f7e37
    </div>
  );
}
