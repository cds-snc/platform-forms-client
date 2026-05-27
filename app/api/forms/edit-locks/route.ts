import { NextRequest, NextResponse } from "next/server";
import { logMessage } from "@lib/logger";
import { getEditLockInfoWithCollaborators } from "@lib/editLockUtils";

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
  userCount: number | null;
  pendingUserCount: number | null;
};

/**
 * API endpoint to get edit-lock information for specified template IDs
 */
export async function POST(request: NextRequest) {
  try {
    const { templateIds } = await request.json();

    if (!Array.isArray(templateIds)) {
      return NextResponse.json({ error: "templateIds must be an array" }, { status: 400 });
    }

    if (!process.env.REDIS_URL) {
      return NextResponse.json({ editLocks: {} });
    }

    const { lockInfoMap, collaboratorCountMap } =
      await getEditLockInfoWithCollaborators(templateIds);

    // Convert to response format
    const editLocks = templateIds.reduce(
      (acc, templateId) => {
        const lockInfo = lockInfoMap.get(templateId);
        if (!lockInfo) {
          return acc;
        }

        const collaboratorCount = collaboratorCountMap.get(templateId);

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
          userCount: collaboratorCount?.userCount ?? null,
          pendingUserCount: collaboratorCount?.pendingUserCount ?? null,
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
}
