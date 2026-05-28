"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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

  // Use ref to access latest templates without recreating fetchEditLockUpdates
  const templatesRef = useRef(templates);

  // Keep ref in sync with state
  useEffect(() => {
    templatesRef.current = templates;
  }, [templates]);

  // Sync templates state when initialTemplates changes e.g. when navigating between tabs
  useEffect(() => {
    setTemplates(initialTemplates);
  }, [initialTemplates]);

  const fetchEditLockUpdates = useCallback(async () => {
    // Poll for ALL templates to detect newly created locks
    const templateIds = templatesRef.current.map((t) => t.id);

    if (templateIds.length === 0) {
      return;
    }

    try {
      const response = await fetch("/api/forms/edit-locks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ templateIds: templateIds }),
      });

      if (!response.ok) {
        return;
      }

      const data: EditLocksResponse = await response.json();

      // Update templates with new lock info
      setTemplates((prevTemplates) =>
        prevTemplates.map((template) => {
          const lockInfo = data.editLocks[template.id];

          if (!lockInfo) {
            // No lock exists for this template
            return {
              ...template,
              hasEditLock: false,
              editLockInfo: null,
            };
          }

          // Lock exists, update it (whether new or existing)
          return {
            ...template,
            hasEditLock: true,
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
            },
          };
        })
      );
    } catch {
      // Silently fail - try again on next poll
    }
  }, []);

  useEffect(() => {
    // Call immediately on mount
    void fetchEditLockUpdates();

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
          <ol className="grid grid-cols-[repeat(auto-fit,16em)] items-start gap-4 p-0">
            {templates.map((card) => {
              // Check if the form has an overdue submission
              if (overdueTemplateIds.includes(card.id)) {
                card.overdue = true;
              }

              return (
                <li className="flex h-full w-full max-w-[16em]" key={card.id}>
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
