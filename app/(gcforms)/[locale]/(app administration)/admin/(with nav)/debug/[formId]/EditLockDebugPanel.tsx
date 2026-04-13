"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "@i18n/client";

type LockDetails = {
  templateId: string;
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

type LockStatus = {
  locked: boolean;
  lockedByOther: boolean;
  isOwner: boolean;
  lock: LockDetails | null;
};

type DebugSnapshot = {
  formId: string;
  channel: string;
  redisEnabled: boolean;
  enforcementEnabled: boolean;
  lockStatus: LockStatus;
  sharedChannelSubscriberCount: number;
  localSubscriberCount: number;
  activeStreamCount: number;
  activeStreamKeys: string[];
};

type DebugEvent = {
  type: "updated" | "takeover-requested";
  occurredAt: string;
  actor?: {
    userId: string;
    userName?: string | null;
    userEmail?: string | null;
    sessionId?: string | null;
  } | null;
  snapshot: DebugSnapshot;
};

type StreamState = "connecting" | "connected" | "disconnected";

const MAX_EVENTS = 50;

const formatDateTime = (value?: string | null) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "medium",
  }).format(date);
};

const getUserIdFromStreamKey = (streamKey: string, formId: string) => {
  const suffix = `:${formId}`;
  if (!streamKey.endsWith(suffix)) {
    return streamKey;
  }

  return streamKey.slice(0, -suffix.length);
};

const getEventSignature = (event: DebugEvent) => {
  return JSON.stringify({
    type: event.type,
    actorUserId: event.actor?.userId ?? null,
    actorEmail: event.actor?.userEmail ?? null,
    locked: event.snapshot.lockStatus.locked,
    lockedByUserId: event.snapshot.lockStatus.lock?.lockedByUserId ?? null,
    sessionId: event.snapshot.lockStatus.lock?.sessionId ?? null,
  });
};

export const EditLockDebugPanel = ({ formId }: { formId: string }) => {
  const { t } = useTranslation("admin-debug");
  const [snapshot, setSnapshot] = useState<DebugSnapshot | null>(null);
  const [events, setEvents] = useState<DebugEvent[]>([]);
  const [streamState, setStreamState] = useState<StreamState>("connecting");
  const [snapshotError, setSnapshotError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadSnapshot = async () => {
      try {
        const response = await fetch(`/api/admin/edit-lock-debug/${formId}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error();
        }

        const nextSnapshot = (await response.json()) as DebugSnapshot;
        if (!cancelled) {
          setSnapshot(nextSnapshot);
          setSnapshotError(null);
        }
      } catch {
        if (!cancelled) {
          setSnapshotError(t("snapshotError"));
        }
      }
    };

    void loadSnapshot();
    const intervalId = window.setInterval(() => {
      void loadSnapshot();
    }, 5000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [formId, t]);

  useEffect(() => {
    const eventSource = new EventSource(`/api/admin/edit-lock-debug/${formId}/events`);

    const handleSnapshot = (event: MessageEvent<string>) => {
      setSnapshot(JSON.parse(event.data) as DebugSnapshot);
      setSnapshotError(null);
      setStreamState("connected");
    };

    const handleDebugEvent = (event: MessageEvent<string>) => {
      const nextEvent = JSON.parse(event.data) as DebugEvent;
      setEvents((currentEvents) => {
        if (
          currentEvents[0] &&
          getEventSignature(currentEvents[0]) === getEventSignature(nextEvent)
        ) {
          return currentEvents;
        }

        return [nextEvent, ...currentEvents].slice(0, MAX_EVENTS);
      });
      setSnapshot(nextEvent.snapshot);
      setStreamState("connected");
    };

    eventSource.addEventListener("snapshot", handleSnapshot as EventListener);
    eventSource.addEventListener("edit-lock-event", handleDebugEvent as EventListener);
    eventSource.onopen = () => {
      setStreamState("connected");
    };
    eventSource.onerror = () => {
      setStreamState("disconnected");
    };

    return () => {
      eventSource.removeEventListener("snapshot", handleSnapshot as EventListener);
      eventSource.removeEventListener("edit-lock-event", handleDebugEvent as EventListener);
      eventSource.close();
    };
  }, [formId]);

  const lockRows = useMemo(() => {
    if (!snapshot?.lockStatus.lock) {
      return [] as Array<[string, string]>;
    }

    const { lock } = snapshot.lockStatus;

    return [
      [t("lockOwner"), lock.lockedByName || lock.lockedByEmail || lock.lockedByUserId],
      [t("lockOwnerEmail"), lock.lockedByEmail || "-"],
      [t("lockSessionId"), lock.sessionId || "-"],
      [t("lockPresence"), lock.presenceStatus || "-"],
      [t("lockVisibility"), lock.visibilityState || "-"],
      [t("lockHeartbeat"), formatDateTime(lock.heartbeatAt)],
      [t("lockExpires"), formatDateTime(lock.expiresAt)],
      [t("lockLastActivity"), formatDateTime(lock.lastActivityAt)],
    ];
  }, [snapshot?.lockStatus, t]);

  return (
    <div className="space-y-8">
      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="mt-0 mb-4">{t("formSectionTitle")}</h2>
        <dl className="grid gap-4 md:grid-cols-2">
          <div>
            <dt className="text-sm font-semibold text-slate-600">{t("formIdLabel")}</dt>
            <dd className="m-0 font-mono text-sm break-all">{formId}</dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-slate-600">{t("channelLabel")}</dt>
            <dd className="m-0 font-mono text-sm break-all">{snapshot?.channel ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-slate-600">{t("streamStatusLabel")}</dt>
            <dd className="m-0">{t(`streamState.${streamState}`)}</dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-slate-600">{t("enforcementLabel")}</dt>
            <dd className="m-0">
              {snapshot ? (snapshot.enforcementEnabled ? t("enabled") : t("disabled")) : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-slate-600">{t("sharedSubscribersLabel")}</dt>
            <dd className="m-0">{snapshot?.sharedChannelSubscriberCount ?? 0}</dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-slate-600">{t("activeStreamsLabel")}</dt>
            <dd className="m-0">{snapshot?.activeStreamCount ?? 0}</dd>
          </div>
        </dl>

        {snapshotError ? <p className="mt-4 text-red-700">{snapshotError}</p> : null}

        <div className="mt-6 rounded-md bg-slate-50 p-4">
          <h3 className="mt-0 mb-3 text-lg">{t("activeStreamsSectionTitle")}</h3>
          <p className="mt-0 mb-3 text-sm text-slate-700">{t("activeStreamsDescription")}</p>
          {snapshot?.activeStreamKeys.length ? (
            <ul className="m-0 list-none space-y-2 p-0">
              {snapshot.activeStreamKeys.map((streamKey) => (
                <li key={streamKey} className="rounded-md border border-slate-200 bg-white p-3">
                  <div className="text-sm font-semibold text-slate-800">
                    {t("activeStreamUserIdLabel")}
                  </div>
                  <div className="font-mono text-sm break-all text-slate-700">
                    {getUserIdFromStreamKey(streamKey, formId)}
                  </div>
                  <div className="mt-2 text-sm font-semibold text-slate-800">
                    {t("activeStreamKeyLabel")}
                  </div>
                  <div className="font-mono text-sm break-all text-slate-700">{streamKey}</div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="m-0 text-sm text-slate-700">{t("noActiveStreams")}</p>
          )}
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="mt-0 mb-4">{t("currentLockSectionTitle")}</h2>
        {snapshot?.lockStatus.locked ? (
          <>
            <p className="mb-4">
              {snapshot.lockStatus.isOwner
                ? t("lockOwnedByCurrentViewer")
                : t("lockOwnedByAnotherUser")}
            </p>
            <dl className="grid gap-4 md:grid-cols-2">
              {lockRows.map(([label, value]) => (
                <div key={label}>
                  <dt className="text-sm font-semibold text-slate-600">{label}</dt>
                  <dd className="m-0 break-all">{value}</dd>
                </div>
              ))}
            </dl>
          </>
        ) : (
          <p className="m-0">{t("noCurrentLock")}</p>
        )}
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="mt-0 mb-4">{t("eventStreamTitle")}</h2>
        {events.length ? (
          <ul className="m-0 list-none space-y-3 p-0">
            {events.map((event, index) => (
              <li key={`${event.occurredAt}-${index}`} className="rounded-md bg-slate-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <strong>{t(`eventType.${event.type}`)}</strong>
                  <span className="text-sm text-slate-600">{formatDateTime(event.occurredAt)}</span>
                </div>
                <details className="mt-3">
                  <summary className="cursor-pointer text-sm font-semibold text-slate-700">
                    {t("eventDetailsSummary")}
                  </summary>
                  <div className="mt-3 space-y-2 text-sm text-slate-700">
                    <div>
                      {t("eventActorLabel")}:{" "}
                      {event.actor?.userName ||
                        event.actor?.userEmail ||
                        event.actor?.userId ||
                        t("unknownActor")}
                    </div>
                    <div>
                      {t("eventActorEmailLabel")}:{" "}
                      {event.actor?.userEmail || t("missingActorEmail")}
                    </div>
                    <div>
                      {event.snapshot.lockStatus.locked
                        ? t("eventLockStateLocked")
                        : t("eventLockStateUnlocked")}
                    </div>
                    <div>
                      {t("activeStreamsLabel")}: {event.snapshot.activeStreamCount}
                    </div>
                    <div>
                      {t("sharedSubscribersLabel")}: {event.snapshot.sharedChannelSubscriberCount}
                    </div>
                  </div>
                </details>
              </li>
            ))}
          </ul>
        ) : (
          <p className="m-0">{t("noEventsYet")}</p>
        )}
      </section>
    </div>
  );
};
