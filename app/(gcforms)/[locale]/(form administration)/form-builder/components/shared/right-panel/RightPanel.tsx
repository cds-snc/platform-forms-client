"use client";

import React, { Fragment, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Transition,
  Tab,
  TabGroup,
  TabPanels,
  TabPanel,
  TabList,
  TransitionChild,
} from "@headlessui/react";
import { useTranslation } from "@i18n/client";
import { CircleButton } from "@clientComponents/globals/Buttons/CircleButton";

import { RightPanelOpen, RoundCloseIcon } from "@serverComponents/icons";
import { cn } from "@lib/utils";
import { useActivePathname } from "@lib/hooks/form-builder/useActivePathname";
import { DownloadCSVWithGroups } from "@formBuilder/[id]/edit/translate/components/DownloadCSVWithGroups";
import { useTreeRef } from "./treeview/provider/TreeRefProvider";

import { TreeView as HeadlessTreeView } from "./headless-treeview/TreeView";

import { TreeView } from "./treeview/TreeView";
import { useTemplateStore } from "@lib/store/useTemplateStore";

import { SelectNextAction } from "./logic/SelectNextAction";
import { useGroupStore } from "../../../../../../../../lib/groups/useGroupStore";
import { SkipLinkReusable } from "@clientComponents/globals/SkipLinkReusable";
import { Language } from "@lib/types/form-builder-types";
import { announce } from "@gcforms/announce";

const renderControlledTree = false;

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
            "whitespace-nowrap border-b-2 px-2 py-2 flex justify-center w-full",
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

  const { id: storeId } = useTemplateStore((s) => ({
    id: s.id,
  }));

  if (storeId && storeId !== id) {
    id = storeId;
  }

  const { activePathname } = useActivePathname();
  const { treeView, togglePanel, open } = useTreeRef();
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

  const [isIntersecting, setIsIntersecting] = useState(false);
  const isBannerEnabled = t("campaignBanner.enabled");

  //If Intersecting fixed-20 else fixed-0, but if BannerEnabled fixed-40 else fixed-20
  const fixedRange = isBannerEnabled
    ? isIntersecting
      ? "top-30"
      : "top-10"
    : isIntersecting
      ? "top-20"
      : "top-0";

  // Observe if the header is offscreen
  // Used to determine the position of the right panel button "toggle" button
  const observer = useRef<IntersectionObserver | null>(null);
  useEffect(() => {
    observer.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
        } else {
          setIsIntersecting(false);
        }
      },
      { threshold: 0 }
    );
    observer.current.observe(document.querySelector("header") as Element);
    return () => {
      observer.current?.disconnect();
    };
  }, []);

  if (
    !activePathname.endsWith("/edit") &&
    !activePathname.endsWith("/translate") &&
    !activePathname.endsWith("/logic")
  ) {
    // Only show the right panel on the form builder edit and translate pages
    return null;
  }

  return (
    <section className="z-10 border-l border-slate-200 bg-white" aria-labelledby="rightPanelTitle">
      <div className={cn("fixed right-0", fixedRange, open && "hidden")}>
        <div className="mr-4 mt-4">
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
      <Transition show={open} as={Fragment}>
        <div className="sticky top-0">
          <div className="flex">
            <TransitionChild
              as={Fragment}
              enter="transform transition ease-in-out duration-500"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="transform transition ease-in-out duration-500"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              <div className="pointer-events-auto w-screen max-w-md">
                {/* <-- Panel Header */}
                <div className="flex h-full flex-col border-l border-slate-200 bg-white">
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
                          onClick={() => togglePanel && togglePanel(false)}
                        >
                          <span className="sr-only">{t("rightPanel.closePanel")}</span>
                          <RoundCloseIcon />
                        </button>
                      </div>
                    </div>
                  </div>
                  {/* Panel Header --> */}
                  {/* <-- Tabs */}
                  <TabGroup selectedIndex={selectedIndex}>
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
                          // Set the active group to the start group before navigating to the logic tab
                          setId("start");
                          router.push(`/${i18n.language}/form-builder/${id}/edit/logic`);
                        }}
                      />
                    </TabList>
                    <TabPanels>
                      <TabPanel>
                        {/* Tree */}
                        <SkipLinkReusable anchor="#pagesTitle">
                          {t("skipLink.pages")}
                        </SkipLinkReusable>
                        <div
                          className="m-0 h-[calc(100vh-150px)] w-full overflow-scroll bg-slate-50"
                          aria-live="polite"
                        >
                          {renderControlledTree && (
                            <TreeView
                              ref={treeView}
                              addItem={() => {}}
                              updateItem={() => {}}
                              removeItem={() => {}}
                              addPage={() => {}}
                            />
                          )}

                          {!renderControlledTree && (
                            <HeadlessTreeView
                              ref={treeView}
                              addItem={() => {}}
                              updateItem={() => {}}
                              removeItem={() => {}}
                              addPage={() => {}}
                              addGroup={() => {}}
                            />
                          )}
                        </div>
                        {/* end tree */}
                      </TabPanel>
                      <TabPanel>
                        {/* Translate */}
                        <SkipLinkReusable anchor="#editTranslationsHeading">
                          {t("skipLink.translate")}
                        </SkipLinkReusable>
                        <div className="m-0 mt-1 w-full p-4" aria-live="polite">
                          <DownloadCSVWithGroups />
                        </div>
                        {/* End translate */}
                      </TabPanel>
                      <TabPanel>
                        {/* Logic */}
                        <SkipLinkReusable anchor="#logicTitle">
                          {t("skipLink.logic")}
                        </SkipLinkReusable>
                        <div className="m-0 w-full" aria-live="polite">
                          {activePathname.endsWith("/logic") && (
                            <SelectNextAction id={id} lang={lang} item={item} />
                          )}
                        </div>
                        {/* end logic */}
                      </TabPanel>
                    </TabPanels>
                  </TabGroup>
                  {/* --> */}
                </div>
              </div>
            </TransitionChild>
          </div>
        </div>
      </Transition>
    </section>
  );
};
