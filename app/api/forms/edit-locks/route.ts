import { NextRequest, NextResponse } from "next/server";
import { logMessage } from "@lib/logger";
import { getEditLockInfoForTemplates } from "@lib/editLockUtils";
import { middleware, sessionExists } from "@lib/middleware";
import { MiddlewareProps, WithRequired } from "@lib/types";
import { authorization } from "@lib/privileges";

type EditLockResponse = {
  lockedByUserId: string;
  lockedByName: string | null;
  lockedAt: string;
  heartbeatAt: string;
  expiresAt: string;
  lastActivityAt: string | null;
  visibilityState: string | null;
  presenceStatus: string | null;
  sessionId: string | null;
};

// Cap accepted templateIds per request to bound DB/Redis work
const MAX_TEMPLATE_IDS_PER_REQUEST = 200;

// Loose sanity check on individual ids (UUIDs, etc.)
const TEMPLATE_ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;

/**
 * API endpoint to get edit-lock information for specified templateIds
 *
 * Secured: Requires authentication and verifies user has access to requested templates
 *
 * Even though POST is not the RESTful choice it allows passing templateIds in the body vs.
 * URL query. If it were a URL query the templateIds would potentially show up in logs.
 */
export const POST = middleware([sessionExists()], async (_req: NextRequest, props) => {
  const { session, body } = props as WithRequired<MiddlewareProps, "session"> & {
    body: { templateIds?: unknown };
  };

  try {
    const { templateIds } = body;

    if (!Array.isArray(templateIds)) {
      return NextResponse.json({ error: "templateIds must be an array" }, { status: 400 });
    }

    if (templateIds.length > MAX_TEMPLATE_IDS_PER_REQUEST) {
      return NextResponse.json(
        { error: `templateIds exceeds maximum of ${MAX_TEMPLATE_IDS_PER_REQUEST}` },
        { status: 400 }
      );
    }

    if (!templateIds.every((id) => typeof id === "string" && TEMPLATE_ID_PATTERN.test(id))) {
      return NextResponse.json({ error: "templateIds contains invalid values" }, { status: 400 });
    }

    if (templateIds.length === 0) {
      return NextResponse.json({ editLocks: {} });
    }

    // Verify user has access to all requested templates using single batch DB query
    try {
      await authorization.check([
        {
          action: "view",
          subject: {
            type: "FormRecord",
            scope: { subjectIds: templateIds },
          },
        },
      ]);
    } catch (error) {
      logMessage.warn(
        `User ${session.user.id} attempted to access edit-locks for templates without permission. TemplateIds: ${templateIds.join(", ")}. Error: ${JSON.stringify(error)}`
      );
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!process.env.REDIS_URL) {
      return NextResponse.json({ editLocks: {} });
    }

    // Lock info only. Collaborator counts are not needed for the polling response
    // and fetching them fanned out one DB query per templateId.
    const lockInfoMap = await getEditLockInfoForTemplates(templateIds);

    // Build response only for templates with active locks. Iterating the map (vs.
    // the full templateIds list) avoids O(N) work for unlocked templates.
    const editLocks: Record<string, EditLockResponse> = {};
    for (const [templateId, lockInfo] of lockInfoMap) {
      editLocks[templateId] = {
        lockedByUserId: lockInfo.lockedByUserId,
        lockedByName: lockInfo.lockedByName ?? null,
        lockedAt: lockInfo.lockedAt.toISOString(),
        heartbeatAt: lockInfo.heartbeatAt.toISOString(),
        expiresAt: lockInfo.expiresAt.toISOString(),
        lastActivityAt: lockInfo.lastActivityAt?.toISOString() ?? null,
        visibilityState: lockInfo.visibilityState ?? null,
        presenceStatus: lockInfo.presenceStatus ?? null,
        sessionId: lockInfo.sessionId ?? null,
      };
    }

    return NextResponse.json(
      { editLocks },
      {
        headers: {
          // Prevent caching since lock info changes frequently
          "Cache-Control": "no-store, must-revalidate",
        },
      }
    );
  } catch (error) {
    logMessage.error(
      `Error fetching edit-lock info for user ${session?.user?.id ?? "unknown"}: ${JSON.stringify(error)}}`
    );
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
});
