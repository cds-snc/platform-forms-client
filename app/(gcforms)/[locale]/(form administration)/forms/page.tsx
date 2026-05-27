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
import { EditLockPresenceStatus, EditLockVisibilityState } from "@lib/editLocks";
import { getTemplateIdsWithEditLocks, getEditLockInfoWithCollaborators } from "@lib/editLockUtils";

const FALLBACK_DATE = Date.now().toString();

// Polling interval for edit-lock updates (in milliseconds)
const EDIT_LOCK_POLL_INTERVAL_MS = 5000; // 5 seconds

async function combineTemplatesWithLockInfo(
  templates: FormsTemplate[]
): Promise<FormsTemplateWithLockInfo[]> {
  // Filter templates that have edit locks
  const templatesWithLocks = templates.filter((t) => t.hasEditLock);

  if (templatesWithLocks.length === 0) {
    return templates;
  }

  // Fetch all lock info and collaborator counts
  const { lockInfoMap, collaboratorCountMap } = await getEditLockInfoWithCollaborators(
    templatesWithLocks.map((t) => t.id)
  );

  // Enrich templates with lock info
  return templates.map((template) => {
    if (!template.hasEditLock) {
      return template;
    }

    const lockInfo = lockInfoMap.get(template.id);
    const collaboratorCount = collaboratorCountMap.get(template.id);

    if (!lockInfo) {
      return template;
    }

    return {
      ...template,
      editLockInfo: {
        lockedByUserId: lockInfo.lockedByUserId,
        lockedByName: lockInfo.lockedByName ?? null,
        lockedByEmail: lockInfo.lockedByEmail ?? null,
        lockedAt: lockInfo.lockedAt,
        heartbeatAt: lockInfo.heartbeatAt,
        expiresAt: lockInfo.expiresAt,
        lastActivityAt: lockInfo.lastActivityAt ?? null,
        visibilityState: lockInfo.visibilityState ?? null,
        presenceStatus: lockInfo.presenceStatus ?? null,
        sessionId: lockInfo.sessionId ?? null,
        userCount: collaboratorCount?.userCount ?? null,
        pendingUserCount: collaboratorCount?.pendingUserCount ?? null,
      },
    };
  });
}

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
  hasEditLock: boolean;
};

export type FormsTemplateWithLockInfo = FormsTemplate & {
  editLockInfo?: {
    lockedByUserId: string;
    lockedByName: string | null;
    lockedByEmail: string | null;
    lockedAt: Date;
    heartbeatAt: Date;
    expiresAt: Date;
    lastActivityAt: Date | null;
    visibilityState: EditLockVisibilityState | null;
    presenceStatus: EditLockPresenceStatus | null;
    sessionId: string | null;
    userCount: number | null;
    pendingUserCount: number | null;
  } | null;
};

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
    };
  });

  const templatesWithEditLocks = await combineTemplatesWithLockInfo(templates);

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
    templatesWithEditLocks.map((template) => template.id)
  );

  return (
    <div className="m-4 grid grid-cols-[23.5em_1fr] gap-8">
      <h1 className="sr-only">{t("title")}</h1>
      <div>
        <Navigation filter={status} />
      </div>
      <div>
        <div className="flex justify-between">
          <div>
            <Invitations invitations={invitations} />
            <ResumeEditingForm />
          </div>
          <NewFormButton />
        </div>

        <div className="mb-4">
          {status == "archived" && (
            <div>
              {t("archivedNotice")}&nbsp;
              <strong>{t("archivedNotice2")}</strong>
            </div>
          )}
        </div>

        <Cards
          filter={status}
          initialTemplates={templatesWithEditLocks}
          overdueTemplateIds={overdueTemplateIds}
          status={status}
          pollIntervalMs={EDIT_LOCK_POLL_INTERVAL_MS}
        />
      </div>
    </div>
  );
}
