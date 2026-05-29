"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
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

const CARDS_PER_BATCH = 20; // Number of cards to render per batch

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
  const [displayedCount, setDisplayedCount] = useState<number>(CARDS_PER_BATCH);

  // Use refs to access latest values without recreating fetchEditLockUpdates
  const templatesRef = useRef(templates);
  const displayedCountRef = useRef(displayedCount);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const fetchInProgressRef = useRef(false);

  // Keep refs in sync with state
  useEffect(() => {
    templatesRef.current = templates;
  }, [templates]);

  useEffect(() => {
    displayedCountRef.current = displayedCount;
  }, [displayedCount]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && displayedCount < templates.length) {
          // Load more cards when sentinel comes into view
          setDisplayedCount((prev) => Math.min(prev + CARDS_PER_BATCH, templates.length));
        }
      },
      {
        root: null, // viewport
        rootMargin: "200px", // Start loading 200px before reaching the sentinel
        threshold: 0,
      }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [displayedCount, templates.length]);

  const fetchEditLockUpdates = useCallback(async () => {
    // Deduplicate: skip if a fetch is already in progress
    if (fetchInProgressRef.current) {
      return;
    }

    // Poll only for displayed templates to reduce API payload
    const displayedTemplates = templatesRef.current.slice(0, displayedCountRef.current);
    const templateIds = displayedTemplates.map((t) => t.id);

    if (templateIds.length === 0) {
      return;
    }

    // Cancel any previous in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();
    fetchInProgressRef.current = true;

    try {
      const response = await fetch("/api/forms/edit-locks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ templateIds: templateIds }),
        signal: abortControllerRef.current.signal,
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
    } catch (error) {
      // Ignore AbortError - it's expected when cancelling requests
      if (error instanceof Error && error.name === "AbortError") {
        return;
      }
      // Silently fail other errors - try again on next poll
    } finally {
      fetchInProgressRef.current = false;
    }
  }, []);

  // Poll for edit lock updates at regular intervals, and also pause/resume polling based on tab visibility
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    const startPolling = () => {
      // Call immediately when starting
      void fetchEditLockUpdates();

      // Set up polling interval
      intervalId = setInterval(() => {
        void fetchEditLockUpdates();
      }, pollIntervalMs);
    };

    const stopPolling = () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab became inactive - pause polling
        stopPolling();
      } else {
        // Tab became active - resume polling
        stopPolling(); // Clear any existing interval first
        startPolling();
      }
    };

    // Start polling on mount
    startPolling();

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      stopPolling();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      // Cancel any in-flight request on unmount
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchEditLockUpdates, pollIntervalMs]);

  const getNoFormsMessage = useMemo(() => {
    if (filter === "recentlyEdited" || !filter) return t("cards.noRecentlyEditedForms");
    if (filter === "draft") return t("cards.noDraftForms");
    if (filter === "published") return t("cards.noPublishedForms");
    if (filter === "archived") return t("cards.noArchivedForms");
    return t("cards.noForms");
  }, [filter, t]);

  // TODO: more testing with below live region. it may need to be placed higher in the tree

  // This is important because otherwise a recalc would happen on user scroll, polling, parent change
  const displayedCards = useMemo(() => {
    return templates.slice(0, displayedCount).map((card) => {
      // Check if the form has an overdue submission (without mutation)
      if (overdueTemplateIds.includes(card.id)) {
        return { ...card, overdue: true };
      }
      // otherwise returns original reference to prevent unnecessary re-renders of Card component
      return card;
    });
  }, [templates, displayedCount, overdueTemplateIds]);

  return (
    <div aria-live="polite">
      {(filter === "recentlyEdited" || !filter) && <p>{t("cards.editLockMessage")}</p>}
      <div
        id={`tabpanel-${filter}`}
        role="tabpanel"
        aria-labelledby={`tab-${filter}`}
        className={`pt-8`}
      >
        {templates.length > 0 ? (
          <>
            <ol className="grid grid-cols-[repeat(auto-fit,16em)] items-start gap-4 p-0">
              {displayedCards.map((card) => (
                <li className="flex h-full w-full max-w-[16em]" key={card.id}>
                  <Card card={card} status={status} />
                </li>
              ))}
            </ol>
            {/* "Sentinel" element for intersection observer */}
            {displayedCount < templates.length && (
              <div ref={loadMoreRef} className="h-4 w-full" aria-hidden="true" />
            )}
          </>
        ) : (
          getNoFormsMessage
        )}
      </div>
    </div>
  );
};
