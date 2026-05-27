import { getRedisInstance } from "@lib/integration/redisConnector";
import { getTemplateCollaboratorCount, EditLockInfo } from "@lib/editLocks";
import { logMessage } from "@lib/logger";

export function parseEditLockInfo(raw: string | null): EditLockInfo | null {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);
    return {
      ...parsed,
      lockedByName: parsed.lockedByName ?? null,
      lockedByEmail: parsed.lockedByEmail ?? null,
      visibilityState: parsed.visibilityState ?? null,
      presenceStatus: parsed.presenceStatus ?? null,
      sessionId: parsed.sessionId ?? null,
      lockedAt: new Date(parsed.lockedAt),
      heartbeatAt: new Date(parsed.heartbeatAt),
      expiresAt: new Date(parsed.expiresAt),
      lastActivityAt: parsed.lastActivityAt ? new Date(parsed.lastActivityAt) : null,
    };
  } catch {
    return null;
  }
}

export async function getTemplateIdsWithEditLocks(): Promise<Set<string>> {
  try {
    if (!process.env.REDIS_URL) {
      return new Set();
    }

    const redis = await getRedisInstance();
    const keys = await redis.keys("edit-lock:*");

    // Extract template IDs from keys (Redis format: "edit-lock:{templateId}")
    const templateIds = keys
      .map((key) => key.replace(/^edit-lock:/, ""))
      .filter((id) => id.length > 0);

    return new Set(templateIds);
  } catch (error) {
    // TODO may want to be INFO instead since not serious if Redis is unavailable - just means edit-lock features won't work
    logMessage.error(`Error fetching edit-lock from Redis: ${error}`);
    return new Set();
  }
}

export async function getEditLockInfoForTemplates(
  templateIds: string[]
): Promise<Map<string, EditLockInfo>> {
  const lockInfoMap = new Map<string, EditLockInfo>();

  if (templateIds.length === 0 || !process.env.REDIS_URL) {
    return lockInfoMap;
  }

  try {
    // Build Redis keys for all templates and fetch in a single MGET call
    const redis = await getRedisInstance();
    const redisKeys = templateIds.map((id) => `edit-lock:${id}`);
    const lockDataArray = await redis.mget(...redisKeys);

    // Parse and map the results
    lockDataArray.forEach((lockData, index) => {
      if (lockData) {
        const lockInfo = parseEditLockInfo(lockData);
        if (lockInfo) {
          const templateId = templateIds[index];
          lockInfoMap.set(templateId, lockInfo);
        }
      }
    });

    return lockInfoMap;
  } catch (error) {
    logMessage.error(`Error fetching edit lock info from Redis: ${error}`);
    return lockInfoMap;
  }
}

export async function getEditLockInfoWithCollaborators(templateIds: string[]) {
  const lockInfoMap = await getEditLockInfoForTemplates(templateIds);

  // Fetch collaborator counts for all locked templates in parallel
  const collaboratorCountPromises = templateIds.map((id) =>
    getTemplateCollaboratorCount(id).catch(() => ({ userCount: null, pendingUserCount: null }))
  );
  const collaboratorCounts = await Promise.all(collaboratorCountPromises);

  // Create a map of templateId to collaborator counts
  const collaboratorCountMap = new Map(
    templateIds.map((id, index) => [id, collaboratorCounts[index]])
  );

  return { lockInfoMap, collaboratorCountMap };
}
