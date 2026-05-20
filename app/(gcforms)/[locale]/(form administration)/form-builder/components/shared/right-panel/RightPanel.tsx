"use client";

import React, { Fragment, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Tab, TabGroup, TabPanels, TabPanel, TabList } from "@headlessui/react";
import { useTranslation } from "@i18n/client";
import { CircleButton } from "@clientComponents/globals/Buttons/CircleButton";

import { RightPanelOpen, RoundCloseIcon } from "@serverComponents/icons";
import { cn } from "@lib/utils";
import { useActivePathname } from "@lib/hooks/form-builder/useActivePathname";
import { DownloadCSVWithGroups } from "@formBuilder/[id]/edit/translate/components/DownloadCSVWithGroups";
import { useTreeRef } from "./headless-treeview/provider/TreeRefProvider";

import { HeadlessTreeView } from "./headless-treeview/TreeView";

import { useTemplateStore } from "@lib/store/useTemplateStore";

import { SelectNextAction } from "./logic/SelectNextAction";
import { useGroupStore } from "@lib/groups/useGroupStore";
import { SkipLinkReusable } from "@clientComponents/globals/SkipLinkReusable";
import { Language } from "@lib/types/form-builder-types";
import { announce } from "@gcforms/announce";

const TabButton = ({
  text,
  onClick,
  className,
}: {
  text: string;
  onClick: () => void;
  className?: string;
}) => {
  const { t } = useTranslation("form-builder");

  const loadTab = () => {
    onClick();
    announce(t("rightPanel.loadTab", { tabPanelLabel: text }));
  };
  return (
    <Tab as={Fragment}>
      {({ selected }) => (
        <button
          id="questionsTabButton"
          className={cn(
            selected
              ? "border-indigo-500 text-indigo-600"
              : "border-transparent text-slate-500 hover:border-gray-300 hover:text-slate-700",
            "flex w-full justify-center border-b-2 px-2 py-2 whitespace-nowrap",
            className
          )}
          onClick={loadTab}
          onKeyDown={(e: React.KeyboardEvent<HTMLButtonElement>) => {
            if (e.key === "Enter" || e.key === " ") loadTab();
          }}
        >
          <span className={cn(selected && "font-bold")}>{text}</span>
        </button>
      )}
    </Tab>
  );
};

export const RightPanel = ({ id, lang }: { id: string; lang: Language }) => {
  const router = useRouter();
  const { t, i18n } = useTranslation(["form-builder", "common"]);
  const sectionRef = useRef<HTMLElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const openButtonRef = useRef<HTMLDivElement | null>(null);
  const suppressToggleSyncRef = useRef(false);
  const popoverStyleSheetRef = useRef<CSSStyleSheet | null>(null);

  const { id: storeId, isLockedByOther } = useTemplateStore((s) => ({
    id: s.id,
    isLockedByOther: s.isLockedByOther,
  }));

  if (storeId && storeId !== id) {
    id = storeId;
  }

  const { activePathname } = useActivePathname();
  const { togglePanel, open } = useTreeRef();
  const getElement = useGroupStore((s) => s.getElement);

  const selectedElementId = useGroupStore((s) => s.selectedElementId);
  const setId = useGroupStore((state) => state.setId);
  const item = (selectedElementId && getElement(selectedElementId)) || null;

  // Update once logic tab / screen  is implemented
  let selectedIndex = 0;

  if (activePathname.endsWith("/translate")) {
    selectedIndex = 1;
  }

  if (activePathname.endsWith("/logic")) {
    selectedIndex = 2;
  }

  const [headerBottom, setHeaderBottom] = useState(0);
  const [hasBlockingDialog, setHasBlockingDialog] = useState(false);
  const isBannerEnabled = t("campaignBanner.enabled");
  const isHeaderVisible = headerBottom > 0;

  //If Intersecting fixed-20 else fixed-0, but if BannerEnabled fixed-40 else fixed-20
  const fixedRange = isBannerEnabled
    ? isHeaderVisible
      ? "top-30"
      : "top-10"
    : isHeaderVisible
      ? "top-20"
      : "top-0";

  useEffect(() => {
    if (!("adoptedStyleSheets" in document)) {
      return;
    }

    const sheet = new CSSStyleSheet();

    document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
    popoverStyleSheetRef.current = sheet;

    return () => {
      document.adoptedStyleSheets = document.adoptedStyleSheets.filter(
        (adoptedSheet) => adoptedSheet !== sheet
      );
      popoverStyleSheetRef.current = null;
    };
  }, []);

  // Observe if the header is offscreen and keep the popover aligned to the
  // visible builder area without using inline styles.
  useEffect(() => {
    const header = document.querySelector("header");
    const footer = document.querySelector("footer");
    const section = sectionRef.current;

    const updateViewportOffsets = () => {
      const nextHeaderBottom = Math.max(header?.getBoundingClientRect().bottom ?? 0, 0);
      const sectionBottom = section?.getBoundingClientRect().bottom ?? window.innerHeight;
      const footerTop = footer?.getBoundingClientRect().top ?? window.innerHeight;
      const panelBoundaryBottom = Math.min(sectionBottom, footerTop);
      const nextPanelBottomInset = Math.max(window.innerHeight - panelBoundaryBottom, 0);

      setHeaderBottom(nextHeaderBottom);
      popoverStyleSheetRef.current?.replaceSync(`
        #rightPanelPopover {
          top: ${nextHeaderBottom}px;
          right: 0;
          left: auto;
          height: calc(100dvh - ${nextHeaderBottom}px - ${nextPanelBottomInset}px);
        }
      `);
    };

    updateViewportOffsets();
    window.addEventListener("resize", updateViewportOffsets);
    window.addEventListener("scroll", updateViewportOffsets, { passive: true });

    return () => {
      window.removeEventListener("resize", updateViewportOffsets);
      window.removeEventListener("scroll", updateViewportOffsets);
    };
  }, []);

  useEffect(() => {
    const isBlockingDialogOpen = () =>
      Boolean(document.querySelector('[role="dialog"][aria-modal="true"], [role="alertdialog"]'));

    const updateBlockingDialogState = () => {
      setHasBlockingDialog(isBlockingDialogOpen());
    };

    updateBlockingDialogState();

    const modalObserver = new MutationObserver(updateBlockingDialogState);
    modalObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["aria-modal", "data-state", "open"],
    });

    return () => {
      modalObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    const popover = popoverRef.current;

    if (!popover || !togglePanel) {
      return;
    }

    const handleToggle = () => {
      const isOpen = popover.matches(":popover-open");

      if (!isOpen && suppressToggleSyncRef.current) {
        suppressToggleSyncRef.current = false;
        return;
      }

      togglePanel(isOpen);

      if (!isOpen) {
        const activeElement = document.activeElement;

        if (activeElement instanceof HTMLElement && popover.contains(activeElement)) {
          openButtonRef.current?.querySelector("button")?.focus();
        }
      }
    };

    popover.addEventListener("toggle", handleToggle);

    return () => {
      popover.removeEventListener("toggle", handleToggle);
    };
  }, [togglePanel]);

  useEffect(() => {
    if (!open || !togglePanel) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }

      event.preventDefault();
      togglePanel(false);
      document.getElementById("editPagesHeading")?.focus();
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, togglePanel]);

  useEffect(() => {
    const popover = popoverRef.current;

    if (!popover) {
      return;
    }

    const isOpen = popover.matches(":popover-open");

    if (hasBlockingDialog) {
      if (isOpen) {
        suppressToggleSyncRef.current = true;
        popover.hidePopover();
      }

      return;
    }

    if (open && !isOpen) {
      popover.showPopover();
      requestAnimationFrame(() => {
        document.getElementById("rightPanelTitle")?.focus();
      });
      return;
    }

    if (!open && isOpen) {
      popover.hidePopover();
    }
  }, [hasBlockingDialog, open]);

  if (
    !activePathname.endsWith("/edit") &&
    !activePathname.endsWith("/translate") &&
    !activePathname.endsWith("/logic")
  ) {
    // Only show the right panel on the form builder edit and translate pages
    return null;
  }

  if (isLockedByOther) {
    return null;
  }

  return (
    <section
      ref={sectionRef}
      className={cn(
        "z-10 shrink-0 overflow-visible [transition-property:max-width,width] duration-500 ease-in-out motion-reduce:transition-none",
        open ? "w-screen max-w-md" : "w-0"
      )}
      aria-labelledby="rightPanelTitle"
    >
      <div className={cn("fixed right-0", fixedRange, open && "hidden")}>
        <div ref={openButtonRef} className="mt-4 mr-4">
          <CircleButton
            id={!open ? "rightPanelTitle" : ""}
            title={t("rightPanel.openPanel")}
            onClick={() => {
              togglePanel && togglePanel(true);
            }}
            dataTestId="rightPanelOpenButton"
          >
            <RightPanelOpen className="inline-block" />
          </CircleButton>
        </div>
      </div>
      <div
        ref={popoverRef}
        id="rightPanelPopover"
        popover="manual"
        className={cn(
          "fixed right-0 bottom-0 left-auto m-0 w-screen max-w-md translate-x-full rounded-none border-0 bg-transparent p-0 text-inherit opacity-0 shadow-none [transition-property:opacity,translate,overlay,display] transition-discrete duration-500 ease-in-out outline-none backdrop:bg-transparent [&:popover-open]:translate-x-0 [&:popover-open]:opacity-100 starting:[&:popover-open]:translate-x-full starting:[&:popover-open]:opacity-0",
          fixedRange
        )}
      >
        <div className="pointer-events-auto flex h-full flex-col border-l border-slate-200 bg-white">
          <div className="p-6">
            <div className="flex justify-between">
              <div>
                <h2 id={open ? "rightPanelTitle" : ""} className="text-base" tabIndex={-1}>
                  {t("rightPanel.openPanel")}
                </h2>
              </div>
              <div>
                <button
                  type="button"
                  className="relative rounded-md bg-white text-slate-500 hover:text-slate-600 focus:ring-2 focus:ring-indigo-500"
                  onClick={() => {
                    togglePanel && togglePanel(false);
                    document.getElementById("editPagesHeading")?.focus();
                  }}
                >
                  <span className="sr-only">{t("rightPanel.closePanel")}</span>
                  <RoundCloseIcon />
                </button>
              </div>
            </div>
          </div>
          <TabGroup selectedIndex={selectedIndex} className="flex h-full min-h-0 flex-col">
            <TabList className={"flex justify-between border-b border-gray-200"}>
              <TabButton
                text={t("rightPanel.pages")}
                onClick={() => {
                  router.push(`/${i18n.language}/form-builder/${id}/edit`);
                }}
              />
              <TabButton
                text={t("rightPanel.translation")}
                onClick={() => {
                  router.push(`/${i18n.language}/form-builder/${id}/edit/translate`);
                }}
              />
              <TabButton
                text={t("rightPanel.logic")}
                onClick={() => {
                  setId("start");
                  router.push(`/${i18n.language}/form-builder/${id}/edit/logic`);
                }}
              />
            </TabList>
            <TabPanels className="min-h-0 flex-1">
              <TabPanel className="flex h-full min-h-0 flex-col">
                <div className="m-0 min-h-0 flex-1 overflow-scroll bg-slate-50" aria-live="polite">
                  <HeadlessTreeView />
                  <SkipLinkReusable anchor="#editPagesHeading">
                    {t("skipLink.pages")}
                  </SkipLinkReusable>
                </div>
                <SkipLinkReusable anchor="#editPagesHeading">
                  {t("skipLink.pages")}
                </SkipLinkReusable>
              </TabPanel>
              <TabPanel className="h-full overflow-auto">
                <SkipLinkReusable anchor="#editTranslationsHeading">
                  {t("skipLink.translate")}
                </SkipLinkReusable>
                <div className="m-0 mt-1 w-full p-4" aria-live="polite">
                  <DownloadCSVWithGroups />
                </div>
              </TabPanel>
              <TabPanel className="h-full overflow-auto">
                <SkipLinkReusable anchor="#logicTitle">{t("skipLink.logic")}</SkipLinkReusable>
                <div className="m-0 w-full" aria-live="polite">
                  {activePathname.endsWith("/logic") && (
                    <SelectNextAction id={id} lang={lang} item={item} />
                  )}
                </div>
              </TabPanel>
            </TabPanels>
          </TabGroup>
        </div>
      </div>
    </section>
  );
};
