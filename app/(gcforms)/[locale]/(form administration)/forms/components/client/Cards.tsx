"use client";

import { useState, useMemo, useCallback } from "react";
import { Card } from "./Card";
import { FormsTemplateWithLockInfo } from "../../page";
import { useTranslation } from "@i18n/client";
import { CARDS_PER_BATCH } from "../constants";
import { useEditLockPolling } from "../hooks/useEditLockPolling";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";

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

  // Handle loading more cards on scroll
  const handleLoadMore = useCallback(() => {
    setDisplayedCount((prev) => Math.min(prev + CARDS_PER_BATCH, templates.length));
  }, [templates.length]);

  // Set up infinite scroll
  const loadMoreRef = useInfiniteScroll({
    displayedCount,
    totalCount: templates.length,
    onLoadMore: handleLoadMore,
  });

  // Set up edit lock polling
  useEditLockPolling({
    templates,
    displayedCount,
    pollIntervalMs,
    onUpdate: setTemplates,
  });

  // Get the appropriate message when there are no forms to display
  const emptyStateMessage = useMemo(() => {
    if (filter === "recentlyEdited" || !filter) return t("cards.noRecentlyEditedForms");
    if (filter === "draft") return t("cards.noDraftForms");
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
    <div aria-live="polite">
      {(filter === "recentlyEdited" || !filter) && <p>{t("cards.editLockMessage")}</p>}
      <div
        id={`tabpanel-${filter}`}
        role="tabpanel"
        aria-labelledby={`tab-${filter}`}
        className="pt-8"
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
            {/* Sentinel element for infinite scroll - triggers load more when visible */}
            {displayedCount < templates.length && (
              <div ref={loadMoreRef} className="h-4 w-full" aria-hidden="true" />
            )}
          </>
        ) : (
          emptyStateMessage
        )}
      </div>
    </div>
  );
};
