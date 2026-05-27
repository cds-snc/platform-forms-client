import { NextRequest, NextResponse } from "next/server";
import { logMessage } from "@lib/logger";
import { getEditLockInfoWithCollaborators } from "@lib/editLockUtils";
import { middleware, sessionExists } from "@lib/middleware";
import { MiddlewareProps, WithRequired } from "@lib/types";
import { authorization } from "@lib/privileges";

type EditLockResponse = {
  lockedByUserId: string;
  lockedByName: string | null;
  lockedByEmail: string | null;
  lockedAt: string;
  heartbeatAt: string;
  expiresAt: string;
  lastActivityAt: string | null;
  visibilityState: string | null;
  presenceStatus: string | null;
  sessionId: string | null;
};

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
    } catch {
      logMessage.warn(
        `User ${session.user.id} attempted to access edit-locks for templates without permission`
      );
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!process.env.REDIS_URL) {
      return NextResponse.json({ editLocks: {} });
    }

    const { lockInfoMap } = await getEditLockInfoWithCollaborators(templateIds);

    // Convert lock info to response format (only for templates with active locks)
    const editLocks = templateIds.reduce(
      (acc, templateId) => {
        const lockInfo = lockInfoMap.get(templateId);
        if (!lockInfo) {
          return acc;
        }

        acc[templateId] = {
          lockedByUserId: lockInfo.lockedByUserId,
          lockedByName: lockInfo.lockedByName ?? null,
          lockedByEmail: lockInfo.lockedByEmail ?? null,
          lockedAt: lockInfo.lockedAt.toISOString(),
          heartbeatAt: lockInfo.heartbeatAt.toISOString(),
          expiresAt: lockInfo.expiresAt.toISOString(),
          lastActivityAt: lockInfo.lastActivityAt?.toISOString() ?? null,
          visibilityState: lockInfo.visibilityState ?? null,
          presenceStatus: lockInfo.presenceStatus ?? null,
          sessionId: lockInfo.sessionId ?? null,
        };

        return acc;
      },
      {} as Record<string, EditLockResponse>
    );

    return NextResponse.json({ editLocks });
  } catch (error) {
    logMessage.error(`Error fetching edit-lock info: ${error}`);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
});
