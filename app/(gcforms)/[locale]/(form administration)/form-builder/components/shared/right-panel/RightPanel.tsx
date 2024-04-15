"use client";

import React, { Fragment, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Transition, Tab } from "@headlessui/react";
import { useTranslation } from "@i18n/client";
import { Button } from "@clientComponents/globals";

import { RightPanelOpen, RoundCloseIcon } from "@serverComponents/icons";
import { cn } from "@lib/utils";
import { useActivePathname } from "@lib/hooks/form-builder";
import { DownloadCSV } from "@formBuilder/[id]/edit/translate/components/DownloadCSV";
import { useTreeRef } from "./treeview/provider/TreeRefProvider";
import { TreeView } from "./treeview/TreeView";
import { useRehydrate } from "@lib/store/useTemplateStore";

const TabButton = ({
  text,
  onClick,
  className,
}: {
  text: string;
  onClick: () => void;
  className?: string;
}) => {
  return (
    <Tab as={Fragment}>
      {({ selected }) => (
        <button
          className={cn(
            selected
              ? "border-indigo-500 text-indigo-600"
              : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
            "whitespace-nowrap border-b-2 px-2 py-2 flex justify-center w-full",
            className
          )}
          onClick={onClick}
        >
          <span className={cn(selected && "font-bold")}>{text}</span>
        </button>
      )}
    </Tab>
  );
};

export const RightPanel = ({ id }: { id: string }) => {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { t, i18n } = useTranslation("form-builder");
  const { activePathname } = useActivePathname();
  const { treeView } = useTreeRef();

  const hasHydrated = useRehydrate();

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
    <div className="relative">
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
          <div className="sticky top-0 z-auto flex h-dvh">
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
                        <h2 className="text-base">{t("rightPanel.openPanel")}</h2>
                      </div>
                      <div>
                        <button
                          type="button"
                          className="relative rounded-md bg-white text-gray-400 hover:text-gray-500 focus:ring-2 focus:ring-indigo-500"
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
                          router.push(`/${i18n.language}/form-builder/${id}/edit/logic`);
                        }}
                      />
                    </Tab.List>
                    <Tab.Panels>
                      <Tab.Panel>
                        <div className="m-0 mt-1 w-full border-t-1 border-slate200 p-0">
                          <TreeView ref={treeView} addItem={() => {}} updateItem={() => {}} />
                        </div>
                      </Tab.Panel>
                      <Tab.Panel>
                        <DownloadCSV />
                      </Tab.Panel>
                      <Tab.Panel>{t("logic.heading")}</Tab.Panel>
                    </Tab.Panels>
                  </Tab.Group>
                  {/* --> */}
                </div>
              </div>
            </Transition.Child>
          </div>
        </div>
      </Transition.Root>
    </div>
  );
};
