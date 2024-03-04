"use client";

import React, { Fragment, useState } from "react";
import { useRouter } from "next/navigation";
import { Transition, Tab } from "@headlessui/react";
import { Button } from "@clientComponents/globals";
import { useTranslation } from "@i18n/client";
import { RightPanelOpen, RoundCloseIcon } from "@serverComponents/icons";
import { cn } from "@lib/utils";
import { LangSwitcher } from "@formBuilder/components/shared/LangSwitcher";

import { DownloadCSV } from "@formBuilder/[id]/edit/translate/components/DownloadCSV";
import { DownloadFileButton } from "@formBuilder/components/shared";

const TabButton = ({
  selected,
  text,
  onClick,
  className,
  ...rest
}: {
  selected: boolean;
  text: string;
  onClick: () => void;
  className?: string;
}) => {
  return (
    <button
      {...rest}
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
  );
};

export const RightPanel = ({ id }: { id: string }) => {
  const [open, setOpen] = useState(true);
  const router = useRouter();
  const { t, i18n } = useTranslation("form-builder");

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
                  {/* start tabs */}
                  <Tab.Group>
                    <Tab.List className={"flex justify-between border-b border-gray-200"}>
                      <Tab as={Fragment}>
                        {({ selected }) => (
                          <TabButton
                            selected={selected}
                            text={t("rightPanel.questions")}
                            onClick={() => {
                              router.push(`/${i18n.language}/form-builder/${id}/edit`);
                            }}
                            className="justify-start px-6"
                          />
                        )}
                      </Tab>
                      {/* 
                      <Tab as={Fragment}>
                        {({ selected }) => (
                          <TabButton selected={selected} text={t("rightPanel.logic")} />
                        )}
                      </Tab>
                      */}
                      <Tab as={Fragment}>
                        {({ selected }) => (
                          <TabButton
                            selected={selected}
                            text={t("rightPanel.translation")}
                            onClick={() => {
                              router.push(`/${i18n.language}/form-builder/${id}/edit/translate`);
                            }}
                          />
                        )}
                      </Tab>
                    </Tab.List>
                    <Tab.Panels className="p-6">
                      <Tab.Panel>
                        <div className="mb-4 flex">
                          <LangSwitcher descriptionLangKey="editingIn" />
                        </div>
                        <DownloadFileButton showInfo={false} autoShowDialog={false} />
                      </Tab.Panel>
                      <Tab.Panel>
                        <DownloadCSV />
                      </Tab.Panel>
                    </Tab.Panels>
                  </Tab.Group>
                  {/* end tabs */}
                </div>
              </div>
            </Transition.Child>
          </div>
        </div>
      </Transition.Root>
    </div>
  );
};
