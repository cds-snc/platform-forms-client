"use client";

import React, { Fragment, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Transition, Tab } from "@headlessui/react";
import { useTranslation } from "@i18n/client";
import { Button } from "@clientComponents/globals";

import { RightPanelOpen, RoundCloseIcon } from "@serverComponents/icons";
import { cn } from "@lib/utils";
import { useActivePathname } from "@lib/hooks/form-builder";
import { DownloadCSVWithGroups } from "@formBuilder/[id]/edit/translate/components/DownloadCSVWithGroups";
import { useTreeRef } from "./treeview/provider/TreeRefProvider";
import { TreeView } from "./treeview/TreeView";
import { useRehydrate, useTemplateStore } from "@lib/store/useTemplateStore";

import { SelectNextAction } from "./logic/SelectNextAction";
import { useGroupStore } from "./treeview/store/useGroupStore";
import { SkipLinkReusable } from "@clientComponents/globals/SkipLinkReusable";
import { Language } from "@lib/types/form-builder-types";
import { useLiveMessage } from "@lib/hooks/useLiveMessage";

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
  const [announce] = useLiveMessage();
  const activate = () => {
    onClick();
    announce(t("rightPanel.activate", { panel: text }));
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      activate();
    }
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
          onClick={activate}
          onKeyDown={handleKeyDown}
        >
          <span className={cn(selected && "font-bold")}>{text}</span>
        </button>
      )}
    </Tab>
  );
};

export const RightPanel = ({ id, lang }: { id: string; lang: Language }) => {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { t, i18n } = useTranslation("form-builder");

  const { id: storeId } = useTemplateStore((s) => ({
    id: s.id,
  }));

  if (storeId && storeId !== id) {
    id = storeId;
  }

  const { activePathname } = useActivePathname();
  const { treeView } = useTreeRef();
  const getElement = useGroupStore((s) => s.getElement);
  const hasHydrated = useRehydrate();

  const selectedElementId = useGroupStore((s) => s.selectedElementId);
  const setId = useGroupStore((state) => state.setId);
  const item = (selectedElementId && getElement(selectedElementId)) || null;

  useEffect(() => {
    if (hasHydrated) {
      setOpen(true);
    }
  }, [hasHydrated, setOpen]);

  // Update once logic tab / screen  is implemented
  let selectedIndex = 0;

  if (activePathname.endsWith("/translate")) {
    selectedIndex = 1;
  }

  if (activePathname.endsWith("/logic")) {
    selectedIndex = 2;
  }

  const [isIntersecting, setIsIntersecting] = useState(false);

  // Observe if the header is offscreen
  // Used to determine the position of the right panel button "toggle" button
  const observer = useRef<IntersectionObserver>();
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
    <section className="relative" aria-labelledby="rightPanelTitle">
      <div className={cn("fixed right-0", isIntersecting ? "top-20" : "top-0", open && "hidden")}>
        <Button
          theme="link"
          className="mr-8 mt-5 whitespace-nowrap [&_svg]:focus:fill-white"
          onClick={() => {
            setOpen(true);
          }}
        >
          <>
            {t("rightPanel.openPanel")} <RightPanelOpen className="ml-2 inline-block " />
          </>
        </Button>
      </div>
      <Transition.Root show={open} as={Fragment}>
        <div className="h-full">
          <div className="flex h-full">
            <Transition.Child
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
                        <h2 id="rightPanelTitle" className="text-base" tabIndex={-1}>
                          {t("rightPanel.openPanel")}
                        </h2>
                      </div>
                      <div>
                        <button
                          type="button"
                          className="relative rounded-md bg-white text-slate-500 hover:text-slate-600 focus:ring-2 focus:ring-indigo-500"
                          onClick={() => setOpen(false)}
                        >
                          <span className="sr-only">{t("rightPanel.closePanel")}</span>
                          <RoundCloseIcon />
                        </button>
                      </div>
                    </div>
                  </div>
                  {/* Panel Header --> */}
                  {/* <-- Tabs */}
                  <Tab.Group selectedIndex={selectedIndex}>
                    <Tab.List className={"flex justify-between border-b border-gray-200"}>
                      <TabButton
                        text={t("rightPanel.questions")}
                        onClick={() => {
                          router.push(`/${i18n.language}/form-builder/${id}/edit`);
                        }}
                        className="justify-start px-6"
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
                    </Tab.List>
                    <Tab.Panels>
                      <Tab.Panel>
                        {/* Tree */}
                        <SkipLinkReusable anchor="#questionsTitle">
                          {t("skipLink.questions")}
                        </SkipLinkReusable>
                        <div className="m-0 w-full" aria-live="polite">
                          <TreeView
                            ref={treeView}
                            addItem={() => {}}
                            updateItem={() => {}}
                            removeItem={() => {}}
                          />
                        </div>
                        {/* end tree */}
                      </Tab.Panel>
                      <Tab.Panel>
                        {/* Translate */}
                        <SkipLinkReusable anchor="#translateTitle">
                          {t("skipLink.translate")}
                        </SkipLinkReusable>
                        <div className="m-0 mt-1 w-full p-4" aria-live="polite">
                          <DownloadCSVWithGroups />
                        </div>
                        {/* End translate */}
                      </Tab.Panel>
                      <Tab.Panel>
                        {/* Logic */}
                        <SkipLinkReusable anchor="#logicTitle">
                          {t("skipLink.logic")}
                        </SkipLinkReusable>
                        <div className="m-0 w-full" aria-live="polite">
                          {activePathname.endsWith("/logic") && (
                            <SelectNextAction lang={lang} item={item} />
                          )}
                        </div>
                        {/* end logic */}
                      </Tab.Panel>
                    </Tab.Panels>
                  </Tab.Group>
                  {/* --> */}
                </div>
              </div>
            </Transition.Child>
          </div>
        </div>
      </Transition.Root>
    </section>
  );
};
