import React, { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Button } from "@components/globals";
import { cn } from "@lib/utils";

export const RightPanel = () => {
  const [open, setOpen] = useState(false);

  const tabs = [
    { name: "All", href: "#", current: true },
    { name: "Online", href: "#", current: false },
    { name: "Offline", href: "#", current: false },
  ];

  return (
    <div>
      <Button
        onClick={() => {
          setOpen(true);
        }}
      >
        open
      </Button>

      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={setOpen}>
          <div className="fixed inset-0" />

          <div className="fixed inset-0 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <div className="pointer-events-none fixed inset-y-0 right-0 top-[72px] flex max-w-full pl-10 sm:pl-16">
                <Transition.Child
                  as={Fragment}
                  enter="transform transition ease-in-out duration-500 sm:duration-700"
                  enterFrom="translate-x-full"
                  enterTo="translate-x-0"
                  leave="transform transition ease-in-out duration-500 sm:duration-700"
                  leaveFrom="translate-x-0"
                  leaveTo="translate-x-full"
                >
                  <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                    <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                      <div className="p-6">
                        <div className="flex items-start justify-between">
                          <Dialog.Title className="text-base font-semibold leading-6 text-gray-900">
                            Team
                          </Dialog.Title>
                          <div className="ml-3 flex h-7 items-center">
                            <button
                              type="button"
                              className="relative rounded-md bg-white text-gray-400 hover:text-gray-500 focus:ring-2 focus:ring-indigo-500"
                              onClick={() => setOpen(false)}
                            >
                              <span className="absolute -inset-2.5" />
                              <span className="sr-only">Close panel</span>X
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
                      content here
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </div>
  );
};
