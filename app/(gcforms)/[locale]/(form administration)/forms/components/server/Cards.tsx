"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "./Card";
import { FormsTemplateWithLockInfo } from "../../page";
import { useTranslation } from "@i18n/client";

type EditLockInfo = {
  lockedByUserId: string;
  lockedByName: string | null;
  lockedByEmail: string | null;
  lockedAt: string;
  heartbeatAt: string;
  expiresAt: string;
  lastActivityAt: string | null;
  visibilityState: "visible" | "hidden" | null;
  presenceStatus: "active" | "idle" | "away" | null;
  sessionId: string | null;
  userCount: number | null;
  pendingUserCount: number | null;
};

type EditLocksResponse = {
  editLocks: Record<string, EditLockInfo>;
};

export const Cards = ({
  filter,
  initialTemplates,
  overdueTemplateIds,
  status,
  pollIntervalMs = 1000,
}: {
  filter?: string;
  initialTemplates: FormsTemplateWithLockInfo[];
  overdueTemplateIds: string[];
  status?: string;
  pollIntervalMs?: number;
}) => {
  const { t } = useTranslation("my-forms");
  const [templates, setTemplates] = useState<FormsTemplateWithLockInfo[]>(initialTemplates);

  // Sync templates state when initialTemplates changes e.g. when navigating between tabs
  useEffect(() => {
    setTemplates(initialTemplates);
  }, [initialTemplates]);

  const fetchEditLockUpdates = useCallback(async () => {
    // Get template IDs that have edit locks
    const templateIdsWithLocks = templates.filter((t) => t.hasEditLock).map((t) => t.id);

    if (templateIdsWithLocks.length === 0) {
      return;
    }

    try {
      const response = await fetch("/api/forms/edit-locks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ templateIds: templateIdsWithLocks }),
      });

      if (!response.ok) {
        return;
      }

      const data: EditLocksResponse = await response.json();

      // Update templates with new lock info
      setTemplates((prevTemplates) =>
        prevTemplates.map((template) => {
          if (!template.hasEditLock) {
            return template;
          }

          const lockInfo = data.editLocks[template.id];
          if (!lockInfo) {
            // Lock no longer exists, remove edit lock info
            return {
              ...template,
              hasEditLock: false,
              editLockInfo: null,
            };
          }

          return {
            ...template,
            editLockInfo: {
              lockedByUserId: lockInfo.lockedByUserId,
              lockedByName: lockInfo.lockedByName,
              lockedByEmail: lockInfo.lockedByEmail,
              lockedAt: new Date(lockInfo.lockedAt),
              heartbeatAt: new Date(lockInfo.heartbeatAt),
              expiresAt: new Date(lockInfo.expiresAt),
              lastActivityAt: lockInfo.lastActivityAt ? new Date(lockInfo.lastActivityAt) : null,
              visibilityState: lockInfo.visibilityState,
              presenceStatus: lockInfo.presenceStatus,
              sessionId: lockInfo.sessionId,
              userCount: lockInfo.userCount,
              pendingUserCount: lockInfo.pendingUserCount,
            },
          };
        })
      );
    } catch {
      // Silently fail - we'll try again on next poll
    }
  }, [templates]);

  useEffect(() => {
    // Set up polling interval
    const intervalId = setInterval(() => {
      void fetchEditLockUpdates();
    }, pollIntervalMs);

    // Clean up on unmount
    return () => {
      clearInterval(intervalId);
    };
  }, [fetchEditLockUpdates, pollIntervalMs]);

  const sharedScreenNoForms = () => {
    return <div>TODO: Co-edit your forms with your team</div>;
  };

  // TODO
  const getNoFormsMessage = () => {
    if (filter === "shared") {
      return sharedScreenNoForms();
    }
    if (filter === "draft") return t("cards.noDraftForms");
    if (filter === "published") return t("cards.noPublishedForms");
    if (filter === "archived") return t("cards.noArchivedForms");
    return t("cards.noForms");
  };

  // TODO: more testing with below live region. it may need to be placed higher in the tree
  return (
    <div aria-live="polite">
      <div
        id={`tabpanel-${filter}`}
        role="tabpanel"
        aria-labelledby={`tab-${filter}`}
        className={`pt-8`}
      >
        {templates.length > 0 ? (
          <ol className="grid grid-cols-[repeat(auto-fit,16em)] justify-items-start gap-4 p-0">
            {templates.map((card) => {
              // Check if the form has an overdue submission
              if (overdueTemplateIds.includes(card.id)) {
                card.overdue = true;
              }

              return (
                <li className="flex w-full max-w-[16em] flex-col" key={card.id}>
                  <Card card={card} status={status} />
                </li>
              );
            })}
          </ol>
        ) : (
          getNoFormsMessage()
        )}
      </div>
    </div>
  );
};
