"use client";

//
// TEMP FILE FOR TESTING - DO NOT MERGE IN MAIN
//

import { useEffect, useRef, useState } from "react";
import { announce, Priority } from "@gcforms/announce";

interface Publication {
  time: string;
  region: string;
  message: string;
}

const longMessages = [
  "Your application has been saved as a draft. You can return later to review your answers and upload the supporting documents before submitting it.",
  "Two required fields still need attention. Review your contact information and mailing address, then check that the details are correct before continuing to the next step.",
  "Your documents are ready for review. Open the document list to check each attachment, remove any incorrect files, and confirm that all required information has been included.",
];

// Temporary manual test page; do not commit.
export default function TestLivePage() {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [messageLength, setMessageLength] = useState("short");
  const [spacing, setSpacing] = useState(0);
  const controllers = useRef<AbortController[]>([]);

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
    return () => {
      observer.disconnect();
      for (const controller of controllers.current) controller.abort();
    };
  }, []);

  const getMessage = (number: number, priority: Priority) =>
    `${priority === Priority.LOW ? "Polite" : "Assertive"} test message ${number} of 3.${
      messageLength === "long" ? ` ${longMessages[number - 1]}` : ""
    }`;

  const queue = (priorities: Priority[]) => {
    const controller = new AbortController();
    controllers.current.push(controller);
    for (const number of [1, 2, 3]) {
      const submit = () => {
        for (const priority of priorities) {
          announce(getMessage(number, priority), priority, {
            allowDuplicates: true,
            lang: "en",
            signal: controller.signal,
          });
        }
      };
      if (spacing === 0 || number === 1) {
        submit();
      } else {
        const timer = setTimeout(
          () => {
            controller.signal.removeEventListener("abort", cancel);
            submit();
          },
          (number - 1) * spacing
        );
        const cancel = () => clearTimeout(timer);
        controller.signal.addEventListener("abort", cancel, { once: true });
      }
    }
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
      </ul>
      <hr className="my-4" />
      <div className="mb-6 flex flex-wrap gap-4">
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
        <label>
          Request spacing
          <select
            className="ml-2 rounded border p-2"
            value={spacing}
            onChange={(event) => setSpacing(Number(event.target.value))}
          >
            <option value={0}>Queue all now (normal one-second publication pacing)</option>
            <option value={3000}>Three seconds</option>
            <option value={6000}>Six seconds</option>
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
            const controller = new AbortController();
            controllers.current.push(controller);
            announce(
              [1, 2, 3].map((number) => getMessage(number, Priority.LOW)).join(" "),
              Priority.LOW,
              { allowDuplicates: true, lang: "en", signal: controller.signal }
            );
          }}
        >
          Polite: one combined announcement
        </button>
        <button
          type="button"
          className={buttonClass}
          onClick={() => {
            for (const controller of controllers.current) controller.abort();
            controllers.current = [];
          }}
        >
          Cancel pending messages
        </button>
        <button type="button" className={buttonClass} onClick={() => setPublications([])}>
          Clear log
        </button>
      </div>
      <h2 className="mb-2">Suggested test sequence</h2>
      <ol className="mb-6 list-decimal pl-6">
        <li>Note the screen reader, browser, versions, and speech rate.</li>
        <li>Test polite, assertive, and mixed delivery with short messages at each spacing.</li>
        <li>Repeat with long messages, then compare the combined polite announcement.</li>
        <li>For cancellation, start a spaced test and cancel before the next request.</li>
        <li>
          Wait for speech to finish between runs. Compare logged text with what was heard; record
          omitted, interrupted, or repeated messages. Clear log does not cancel delivery.
        </li>
      </ol>
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
