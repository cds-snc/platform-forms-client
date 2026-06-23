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
  tabStatus,
  initialTemplates,
  overdueTemplateIds,
  pollIntervalMs,
}: {
  tabStatus: FormTabStatus;
  initialTemplates: FormsTemplateWithLockInfo[];
  overdueTemplateIds: string[];
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

  // Handle template removal (e.g., when archived)
  const handleTemplateRemoved = useCallback((templateId: string) => {
    startTransition(() => {
      setTemplates((prev) => prev.filter((t) => t.id !== templateId));
    });
  }, []);

  // Setup edit lock polling - only poll for draft forms in the recentlyEdited and draft tabs
  const shouldPoll =
    !tabStatus || tabStatus === TAB_STATUS.RECENTLY_EDITED || tabStatus === TAB_STATUS.DRAFT;
  const draftTemplates = useMemo(
    () => templates.filter((t) => t.isPublished === false && t.ttl === null),
    [templates]
  );
  useEditLockPolling({
    templates: draftTemplates,
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
    if (tabStatus === TAB_STATUS.RECENTLY_EDITED || !tabStatus)
      return t("cards.noRecentlyEditedForms");
    if (tabStatus === TAB_STATUS.DRAFT) return t("cards.noDraftsForms");
    if (tabStatus === TAB_STATUS.PUBLISHED) return t("cards.noPublishedForms");
    if (tabStatus === TAB_STATUS.ARCHIVED) return t("cards.noArchivedForms");
    if (tabStatus === TAB_STATUS.CLOSED) return t("cards.noClosedForms");
    return t("cards.noForms");
  }, [tabStatus, t]);

  // Prepare cards for display with overdue status
  // Memoized to prevent recalculation on every render (e.g. every 5s during polling)
  const displayedCards = useMemo(() => {
    return templates.slice(0, displayedCount).map((card) => {
      if (overdueTemplateIds.includes(card.id)) {
        return { ...card, overdue: true };
      }
      // Return original reference to prevent unnecessary Card re-renders
      return card;
    });
  }, [templates, displayedCount, overdueTemplateIds]);

  return (
    <ViewTransition name="forms-tab-switch">
      <div id={`tabpanel-${tabStatus}`} role="tabpanel" aria-labelledby={`tab-${tabStatus}`}>
        {templates.length > 0 ? (
          <>
            <ol className="grid grid-cols-[repeat(auto-fit,16em)] items-start gap-4 p-0">
              {(!tabStatus ||
                tabStatus === TAB_STATUS.RECENTLY_EDITED ||
                tabStatus === TAB_STATUS.DRAFT ||
                tabStatus === TAB_STATUS.PUBLISHED) && (
                <li className="flex h-full w-full max-w-[16em]" key={-1}>
                  <NewFormButton />
                </li>
              )}
              {displayedCards.map((card) => (
                <li className="flex h-full w-full max-w-[16em]" key={card.id}>
                  <Card card={card} status={tabStatus} onRemove={handleTemplateRemoved} />
                </li>
              ))}
            </ol>
            {/* Sentinel element for infinite scroll - triggers load more when visible */}
            {displayedCount < templates.length && (
              <div ref={loadMoreRef} className="h-4 w-full" aria-hidden="true" />
            )}
          </>
        ) : (
          <div>
            {emptyStateMessage}
            {tabStatus !== TAB_STATUS.ARCHIVED && (
              <ol className="mt-4 grid grid-cols-[repeat(auto-fit,16em)] items-start gap-4 p-0">
                <li className="mt-4 flex h-full w-full max-w-[16em]" key={-1}>
                  <NewFormButton />
                </li>
              </ol>
            )}
          </div>
        )}
      </div>
    </ViewTransition>
  );
};
