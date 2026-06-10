"use client";

import { useState, useMemo, useCallback, useEffect, startTransition, ViewTransition } from "react";
import { Card } from "./Card";
import { FormsTemplateWithLockInfo, FormTabStatus, TAB_STATUS } from "../types";
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
  filter?: FormTabStatus;
  initialTemplates: FormsTemplateWithLockInfo[];
  overdueTemplateIds: string[];
  status?: FormTabStatus;
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

  // Setup infinite scroll
  const handleLoadMore = useCallback(() => {
    startTransition(() => {
      setDisplayedCount((prev) => Math.min(prev + CARDS_PER_BATCH, templates.length));
    });
  }, [templates.length]);
  const loadMoreRef = useInfiniteScroll({
    displayedCount,
    totalCount: templates.length,
    onLoadMore: handleLoadMore,
  });

  // Setup edit lock polling - only poll for recentlyEdited and draft tabs
  const shouldPoll =
    !filter || filter === TAB_STATUS.RECENTLY_EDITED || filter === TAB_STATUS.DRAFT;
  useEditLockPolling({
    templates,
    displayedCount,
    pollIntervalMs,
    enabled: shouldPoll,
    onUpdate: (nextTemplates) => {
      startTransition(() => {
        setTemplates(nextTemplates);
      });
    },
  });

  // Get the appropriate message when there are no forms to display
  const emptyStateMessage = useMemo(() => {
    if (filter === TAB_STATUS.RECENTLY_EDITED || !filter) return t("cards.noRecentlyEditedForms");
    if (filter === TAB_STATUS.DRAFT) return t("cards.noDraftsForms");
    if (filter === TAB_STATUS.PUBLISHED) return t("cards.noPublishedForms");
    if (filter === TAB_STATUS.ARCHIVED) return t("cards.noArchivedForms");
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
              {(status === TAB_STATUS.DRAFT || status === TAB_STATUS.PUBLISHED || !status) && (
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
