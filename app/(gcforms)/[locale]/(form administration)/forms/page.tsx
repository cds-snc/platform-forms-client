import { serverTranslation } from "@i18n";
import { Metadata } from "next";
import { authCheckAndRedirect } from "@lib/actions";
import { AccessControlError } from "@lib/auth/errors";
import { redirect } from "next/navigation";
import { Navigation } from "./components/server/Navigation";
import { Cards } from "./components/client/Cards";
import { NewFormButton } from "./components/server/NewFormButton";
import { AccountDetails } from "./components/server/AccountDetails";
import { ResumeEditingForm } from "./components/ResumeEditingForm";
import { getAllTemplatesForUser, TemplateOptions } from "@lib/templates";
import { DeliveryOption } from "@lib/types";
import { getOverdueTemplateIds } from "@lib/overdue";
import { Invitations } from "./components/Invitations/Invitations";
import { prisma } from "@gcforms/database";
import { getTemplateIdsWithEditLocks, getEditLockInfoWithCollaborators } from "@lib/editLockUtils";
import { EDIT_LOCK_POLL_INTERVAL_MS } from "./components/constants";

const FALLBACK_DATE = Date.now().toString();

async function combineTemplatesWithLockInfo(
  templates: FormsTemplate[]
): Promise<FormsTemplateWithLockInfo[]> {
  // Filter templates that have edit locks
  const templatesWithLocks = templates.filter((t) => t.hasEditLock);

  if (templatesWithLocks.length === 0) {
    return templates;
  }

  // Fetch lock info (without collaborator counts - those come from DB)
  const { lockInfoMap } = await getEditLockInfoWithCollaborators(
    templatesWithLocks.map((t) => t.id)
  );

  // Enrich templates with lock info
  return templates.map((template) => {
    if (!template.hasEditLock) {
      return template;
    }

    const lockInfo = lockInfoMap.get(template.id);

    if (!lockInfo) {
      return template;
    }

    return {
      ...template,
      editLockInfo: {
        lockedByUserId: lockInfo.lockedByUserId,
        lockedByName: lockInfo.lockedByName ?? null,
        lockedAt: lockInfo.lockedAt,
        heartbeatAt: lockInfo.heartbeatAt,
        expiresAt: lockInfo.expiresAt,
        lastActivityAt: lockInfo.lastActivityAt ?? null,
        visibilityState: lockInfo.visibilityState ?? null,
        presenceStatus: lockInfo.presenceStatus ?? null,
        sessionId: lockInfo.sessionId ?? null,
      },
    };
  });
}

export type { FormsTemplate, FormsTemplateWithLockInfo } from "./components/types";
import type { FormsTemplate, FormsTemplateWithLockInfo } from "./components/types";
import { CoEditingHelp } from "./components/server/CoEditingHelp";

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const params = await props.params;

  const { locale } = params;

  const { t } = await serverTranslation("my-forms", { lang: locale });
  return {
    title: t("title"),
  };
}

export default async function Page(props: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const searchParams = await props.searchParams;

  const { status } = searchParams;

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
      isPublished: status === "published" ? true : status === "draft" ? false : undefined,
      ttl: status === "archived" ? { not: null } : null,
    },
    sortByDateUpdated: "desc",
  };
  const allTemplates = await getAllTemplatesForUser(options);
  const templateIdsWithEditLocks = await getTemplateIdsWithEditLocks();

  // Type for template with counts from DB
  type TemplateWithCounts = (typeof allTemplates)[number] & {
    _count: {
      users: number;
      invitations: number;
    };
  };

  const templates = allTemplates.map((template) => {
    const {
      id,
      form: { titleEn = "", titleFr = "" },
      name,
      deliveryOption = { emailAddress: "" },
      isPublished,
      updatedAt,
      ttl,
    } = template;

    // Calculate collaborator count from DB data
    const templateWithCounts = template as TemplateWithCounts;
    const userCount = templateWithCounts._count?.users ?? 0;
    const pendingUserCount = templateWithCounts._count?.invitations ?? 0;

    // Determine if template is shared (has 1 or more collaborators beyond owner)
    // userCount includes the owner, so we need at least 2 total (owner + 1 collaborator)
    const isShared = userCount + pendingUserCount >= 2;

    return {
      id,
      titleEn,
      titleFr,
      deliveryOption: deliveryOption as DeliveryOption,
      name,
      isPublished,
      date: updatedAt ?? FALLBACK_DATE,
      url: `/${locale}/id/${id}`,
      overdue: false,
      ttl: ttl ? new Date(ttl) : null,
      hasEditLock: templateIdsWithEditLocks.has(id),
      isShared,
      collaboratorCount: {
        userCount,
        pendingUserCount,
      },
    };
  });

  const templatesWithEditLocks = await combineTemplatesWithLockInfo(templates);

  // Filter templates based on status
  // For "recentlyEdited" (or no status), show the 4 most recently updated templates
  const filteredTemplates =
    status === "recentlyEdited" || !status
      ? templatesWithEditLocks.slice(0, 4)
      : templatesWithEditLocks;

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

  const overdueTemplateIds = await getOverdueTemplateIds(
    filteredTemplates.map((template) => template.id)
  );

  return (
    <div className="m-4 grid min-h-screen grid-cols-[20em_1fr_4em] gap-8">
      <h1 className="sr-only">{t("title")}</h1>
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
          {status == "draft" && <ResumeEditingForm />}
          <CoEditingHelp />
        </div>
      </div>
      <div className="flex h-full min-h-0 flex-col">
        <div className="">
          <Invitations invitations={invitations} />
          <div className="mb-4">
            {status == "archived" && (
              <div>
                {t("archivedNotice")}&nbsp;
                <strong>{t("archivedNotice2")}</strong>
              </div>
            )}
          </div>
        </div>
        <Cards
          // tell react the state resets when tabs change
          key={status || "default"}
          filter={status}
          initialTemplates={filteredTemplates}
          overdueTemplateIds={overdueTemplateIds}
          status={status}
          pollIntervalMs={EDIT_LOCK_POLL_INTERVAL_MS}
        />
      </div>
      <div className="mr-6">
        <NewFormButton />
      </div>
    </div>
  );
}
