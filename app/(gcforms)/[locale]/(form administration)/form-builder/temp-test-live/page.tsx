"use client";

//
// TEMP FILE FOR TESTING - DO NOT MERGE IN MAIN
//

import { useEffect, useRef, useState } from "react";
import { announce, Priority } from "@gcforms/announce";
import { ANNOUNCE_PUBLICATION_INTERVAL_MS } from "@lib/client/announceConfig";

interface Publication {
  time: string;
  region: string;
  message: string;
}

interface TestMessage {
  message: string;
  priority: Priority;
}

const longMessages = [
  "Your application has been saved as a draft. You can return later to review your answers and upload the supporting documents before submitting it.",
  "Two required fields still need attention. Review your contact information and mailing address, then check that the details are correct before continuing to the next step.",
  "Your documents are ready for review. Open the document list to check each attachment, remove any incorrect files, and confirm that all required information has been included.",
];

// Temporary manual test page; remove before merging.
export default function TestLivePage() {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [messageLength, setMessageLength] = useState("short");
  const [delivery, setDelivery] = useState("library");
  const controllers = useRef<AbortController[]>([]);
  const nativeHost = useRef<HTMLDivElement>(null);
  const nativePolite = useRef<HTMLDivElement>(null);
  const nativeAssertive = useRef<HTMLDivElement>(null);
  const nativeQueue = useRef<TestMessage[]>([]);
  const nativeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const host = document.querySelector('[data-announce-host="root"]');
    if (!host) {
      throw new Error("No root announcement host found. These tests cannot publish feedback.");
    }

    const observer = new MutationObserver((records) => {
      const updates: Publication[] = [];
      for (const record of records) {
        if (!(record.target instanceof HTMLElement) || !record.target.hasAttribute("aria-live")) {
          continue;
        }
        // Read the added nodes, not current text: several updates can arrive in one callback.
        const message = Array.from(record.addedNodes, (node) => node.textContent ?? "").join("");
        updates.push({
          time: new Date().toISOString().slice(11, 23),
          region: record.target.getAttribute("data-testid") ?? "unknown region",
          message: message || "(cleared)",
        });
      }
      if (updates.length) {
        setPublications((previous) => [...previous, ...updates].slice(-200));
      }
    });
    observer.observe(host, { childList: true, subtree: true });
    if (!nativeHost.current) throw new Error("Plain live-region host is missing.");
    observer.observe(nativeHost.current, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      for (const controller of controllers.current) controller.abort();
      clearTimeout(nativeTimer.current);
      nativeTimer.current = undefined;
      nativeQueue.current = [];
    };
  }, []);

  const getMessage = (number: number, priority: Priority) =>
    `${priority === Priority.LOW ? "Polite" : "Assertive"} test message ${number} of 3.${
      messageLength === "long" ? ` ${longMessages[number - 1]}` : ""
    }`;

  const cancelPending = () => {
    for (const controller of controllers.current) controller.abort();
    controllers.current = [];
    clearTimeout(nativeTimer.current);
    nativeTimer.current = undefined;
    nativeQueue.current = [];
  };

  const publishNative = () => {
    const next = nativeQueue.current.shift();
    if (!next) return;
    const region = next.priority === Priority.LOW ? nativePolite.current : nativeAssertive.current;
    if (!region) throw new Error("Plain live region is missing.");
    region.textContent = next.message;
    nativeTimer.current = setTimeout(() => {
      nativeTimer.current = undefined;
      publishNative();
    }, ANNOUNCE_PUBLICATION_INTERVAL_MS);
  };

  const submit = (messages: TestMessage[]) => {
    if (delivery === "native") {
      nativeQueue.current.push(...messages);
      if (nativeTimer.current === undefined) publishNative();
      return;
    }
    const controller = new AbortController();
    controllers.current.push(controller);
    for (const { message, priority } of messages) {
      announce(message, priority, {
        allowDuplicates: true,
        lang: "en",
        signal: controller.signal,
      });
    }
  };

  const queue = (priorities: Priority[]) => {
    const messages: TestMessage[] = [];
    for (const number of [1, 2, 3]) {
      for (const priority of priorities) {
        messages.push({ message: getMessage(number, priority), priority });
      }
    }
    submit(messages);
  };

  const buttonClass = "rounded border px-4 py-2";

  return (
    <main lang="en" id="content" className="mx-auto max-w-4xl p-8">
      <h1 className="mb-4">Live-region manual tests (temporary)</h1>
      <p>Test results:</p>
      <ul>
        <li>Jaws/NVDA+Edge work great</li>
        <li>
          Only VoiceOver struggles with queued messages. E.g. of the 3 polite messages only the last
          is announced while assertive announces the last two messages
        </li>
        <li>
          Increasing the queue spacing to 3 seconds helps for short messages. Longer messages would
          need a longer spacing delay. Combining messages works great but may have a buffer limit on
          the size of the message at some point.{" "}
        </li>
        <li>Native Live Regions - same behavior with VoiceOver</li>
      </ul>
      <hr className="my-8" />
      <div className="mb-6 flex flex-wrap gap-4">
        <label>
          Delivery
          <select
            className="ml-2 rounded border p-2"
            value={delivery}
            onChange={(event) => {
              cancelPending();
              setDelivery(event.target.value);
            }}
          >
            <option value="library">Announce library</option>
            <option value="native">Plain live regions (paced FIFO)</option>
          </select>
        </label>
        <label>
          Message length
          <select
            className="ml-2 rounded border p-2"
            value={messageLength}
            onChange={(event) => setMessageLength(event.target.value)}
          >
            <option value="short">Short</option>
            <option value="long">Long</option>
          </select>
        </label>
      </div>
      <div className="mb-6 flex flex-wrap gap-4">
        <button type="button" className={buttonClass} onClick={() => queue([Priority.LOW])}>
          Polite only
        </button>
        <button type="button" className={buttonClass} onClick={() => queue([Priority.HIGH])}>
          Assertive only
        </button>
        <button
          type="button"
          className={buttonClass}
          onClick={() => queue([Priority.LOW, Priority.HIGH])}
        >
          Mixed priorities
        </button>
        <button
          type="button"
          className={buttonClass}
          onClick={() => {
            submit([
              {
                message: [1, 2, 3].map((number) => getMessage(number, Priority.LOW)).join(" "),
                priority: Priority.LOW,
              },
            ]);
          }}
        >
          Polite: one combined announcement
        </button>
        <button type="button" className={buttonClass} onClick={cancelPending}>
          Cancel pending messages
        </button>
        <button type="button" className={buttonClass} onClick={() => setPublications([])}>
          Clear log
        </button>
      </div>
      <div ref={nativeHost} className="visually-hidden" lang="en">
        <div
          ref={nativePolite}
          role="status"
          aria-live="polite"
          aria-atomic="true"
          data-testid="plain-polite"
        />
        <div
          ref={nativeAssertive}
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
          data-testid="plain-assertive"
        />
      </div>
      <hr className="my-8" />
      <h2 className="mb-2">Live-region changes (last 200; timestamps in UTC)</h2>
      <table className="w-full text-left">
        <thead>
          <tr>
            <th scope="col">Time</th>
            <th scope="col">Region</th>
            <th scope="col">Text</th>
          </tr>
        </thead>
        <tbody>
          {publications.map((publication, index) => (
            <tr key={index}>
              <td className="pr-4">{publication.time}</td>
              <td className="pr-4">{publication.region}</td>
              <td>{publication.message}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
