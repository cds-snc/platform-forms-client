import {
  EditLockEvent,
  EditLockStatus,
  getEditLockStatus,
  getLocalEditLockSubscriberCount,
  shouldEnforceTemplateEditLock,
  subscribeToEditLockEvents,
} from "@lib/editLocks";
import {
  getEditLockEventStreamDebugSnapshot,
  subscribeToSharedEditLockEvents,
} from "@lib/editLockEventStreams";

export type EditLockDebugSnapshot = {
  formId: string;
  channel: string;
  redisEnabled: boolean;
  enforcementEnabled: boolean;
  lockStatus: EditLockStatus;
  sharedChannelSubscriberCount: number;
  localSubscriberCount: number;
  activeStreamCount: number;
  activeStreamKeys: string[];
};

export const getEditLockDebugSnapshot = async (
  templateId: string,
  userId?: string
): Promise<EditLockDebugSnapshot> => {
  const [lockStatus, enforcementEnabled] = await Promise.all([
    getEditLockStatus(templateId, userId),
    shouldEnforceTemplateEditLock(templateId),
  ]);
  const streamSnapshot = getEditLockEventStreamDebugSnapshot(templateId);

  return {
    formId: templateId,
    channel: streamSnapshot.channel,
    redisEnabled: Boolean(process.env.REDIS_URL),
    enforcementEnabled,
    lockStatus,
    sharedChannelSubscriberCount: streamSnapshot.sharedChannelSubscriberCount,
    localSubscriberCount: getLocalEditLockSubscriberCount(templateId),
    activeStreamCount: streamSnapshot.activeStreamCount,
    activeStreamKeys: streamSnapshot.activeStreamKeys,
  };
};

export const subscribeToAdminEditLockDebugEvents = async (
  templateId: string,
  subscriber: (event: EditLockEvent) => void
) => {
  if (process.env.REDIS_URL) {
    return subscribeToSharedEditLockEvents(templateId, subscriber);
  }

  return subscribeToEditLockEvents(templateId, subscriber);
};
