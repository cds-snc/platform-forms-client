"use client";

import React, { Fragment, useState } from "react";
import { Transition } from "@headlessui/react";
import { Button } from "@clientComponents/globals";
import { cn } from "@lib/utils";
import { useTranslation } from "@i18n/client";
import { RightPanelOpen, RoundCloseIcon } from "@serverComponents/icons";

export const RightPanel = () => {
  const [open, setOpen] = useState(true);
  const { t } = useTranslation("form-builder");

  const tabs = [
    { name: "Questions", href: "#", current: false },
    { name: "Translation", href: "#", current: true },
    { name: "Logic", href: "#", current: false },
  ];

  return (
    <div className="relative">
      <div className="fixed right-2 top-20 z-10">
        <Button
          theme="link"
          className="mr-10 mt-5 whitespace-nowrap [&_svg]:focus:fill-white"
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
          <div className="sticky top-0 z-20 flex h-dvh">
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
                <div className="flex h-full flex-col overflow-y-scroll border-l border-slate-200 bg-white">
                  <div className="p-6">
                    <div className="flex justify-between">
                      <div>
                        <h2 className="text-base">Title</h2>
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
                  <div className="border-b border-gray-200">
                    <div className="px-6">
                      <nav className="-mb-px flex space-x-6">
                        {tabs.map((tab) => (
                          <a
                            key={tab.name}
                            href={tab.href}
                            className={cn(
                              tab.current
                                ? "border-indigo-500 text-indigo-600"
                                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                              "whitespace-nowrap border-b-2 px-1 pb-4 text-sm font-medium"
                            )}
                          >
                            {tab.name}
                          </a>
                        ))}
                      </nav>
                    </div>
                  </div>
                  <div className="p-6">content here</div>
                </div>
              </div>
            </Transition.Child>
          </div>
        </div>
      </Transition.Root>
    </div>
  );
};
