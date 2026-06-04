"use client";

import { useState, useMemo, useCallback, useEffect, startTransition, ViewTransition } from "react";
import { Card } from "./Card";
import { FormsTemplateWithLockInfo } from "../types";
import { useTranslation } from "@i18n/client";
import { CARDS_PER_BATCH } from "../constants";
import { useEditLockPolling } from "../hooks/useEditLockPolling";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import { NewFormButton } from "./NewFormButton";

export const Cards = ({
  filter,
  initialTemplates,
  overdueTemplateIds,
  status,
  pollIntervalMs,
}: {
  filter?: string;
  initialTemplates: FormsTemplateWithLockInfo[];
  overdueTemplateIds: string[];
  status?: string;
  pollIntervalMs: number;
}) => {
  const { t } = useTranslation("my-forms");
  const [templates, setTemplates] = useState<FormsTemplateWithLockInfo[]>(initialTemplates);
  const [displayedCount, setDisplayedCount] = useState<number>(CARDS_PER_BATCH);

  useEffect(() => {
    startTransition(() => {
      setTemplates(initialTemplates);
      setDisplayedCount(CARDS_PER_BATCH);
    });
  }, [initialTemplates]);

  // Handle loading more cards on scroll
  const handleLoadMore = useCallback(() => {
    startTransition(() => {
      setDisplayedCount((prev) => Math.min(prev + CARDS_PER_BATCH, templates.length));
    });
  }, [templates.length]);

  // Setup infinite scroll
  const loadMoreRef = useInfiniteScroll({
    displayedCount,
    totalCount: templates.length,
    onLoadMore: handleLoadMore,
  });

  // Setup edit lock polling
  useEditLockPolling({
    templates,
    displayedCount,
    pollIntervalMs,
    onUpdate: (nextTemplates) => {
      startTransition(() => {
        setTemplates(nextTemplates);
      });
    },
  });

  // Get the appropriate message when there are no forms to display
  const emptyStateMessage = useMemo(() => {
    if (filter === "recentlyEdited" || !filter) return t("cards.noRecentlyEditedForms");
    if (filter === "draft") return t("cards.noDraftsForms");
    if (filter === "published") return t("cards.noPublishedForms");
    if (filter === "archived") return t("cards.noArchivedForms");
    return t("cards.noForms");
  }, [filter, t]);

  // Prepare cards for display with overdue status
  // Memoized to prevent recalculation on every render (e.g. every 5s during polling)
  const displayedCards = useMemo(() => {
    return templates.slice(0, displayedCount).map((card) => {
      // Add overdue flag without mutating the original card
      if (overdueTemplateIds.includes(card.id)) {
        return { ...card, overdue: true };
      }
      // Return original reference to prevent unnecessary Card re-renders
      return card;
    });
  }, [templates, displayedCount, overdueTemplateIds]);

  return (
    <ViewTransition name="forms-tab-switch">
      <div id={`tabpanel-${filter}`} role="tabpanel" aria-labelledby={`tab-${filter}`}>
        {templates.length > 0 ? (
          <>
            <ol className="grid grid-cols-[repeat(auto-fit,16em)] items-start gap-4 p-0">
              {(status === "draft" || !status) && (
                <li className="flex h-full w-full max-w-[16em]" key={-1}>
                  <NewFormButton />
                </li>
              )}
              {displayedCards.map((card) => (
                <li className="flex h-full w-full max-w-[16em]" key={card.id}>
                  <Card card={card} status={status} />
                </li>
              ))}
            </ol>
            {/* Sentinel element for infinite scroll - triggers load more when visible */}
            {displayedCount < templates.length && (
              <div ref={loadMoreRef} className="h-4 w-full" aria-hidden="true" />
            )}
          </>
        ) : (
          emptyStateMessage
        )}
      </div>
    </ViewTransition>
  );
};
