import { FormElement } from "@cdssnc/gcforms-types";
import { useTranslation } from "@i18n/client";
import { logMessage } from "@lib/logger";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { LocalizedElementProperties } from "@lib/types/form-builder-types";
import { createContext, useContext, useState } from "react";

// TODO check if shown element is on the next page and if so DO not announce

/**
 * Why would I use this?
 * When adding ARIA semantics become very complex, is simply not possible, or you would simply like
 * more control over what is announced to the AT user.
 */

// TODO:
// - think about queueing announcements to avoid overflowing an ATs buffer.
// - does cleaning up (clear text) a live region improve stability?

export enum Priority {
  LOW = "polite",
  HIGH = "assertive",
}

const LiveMessageContext = createContext({
  messageLow: "",
  messageHigh: "",
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setMessageLow: (messageLow: string) => {},
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setMessageHigh: (messageHigh: string) => {},
});

export const LiveMessagePovider = ({ children }: { children: React.ReactNode }) => {
  const [messageLow, setMessageLow] = useState<string>("");
  const [messageHigh, setMessageHigh] = useState<string>("");
  return (
    <LiveMessageContext.Provider value={{ messageLow, messageHigh, setMessageLow, setMessageHigh }}>
      {children}
    </LiveMessageContext.Provider>
  );
};

export const LiveMessage = () => {
  const { messageLow, messageHigh } = useContext(LiveMessageContext);
  // Prime the live regions and add redundant aria-live attribute for best AT support
  return (
    <>
      <div role="status" aria-live="polite" className="sr-only">
        {messageLow}
      </div>
      <div role="alert" aria-live="assertive" className="sr-only">
        {messageHigh}
      </div>
    </>
  );
};

/**
 * A Util to access the live region to speak (announce) a message.
 *
 * Example usage:
 *   const [speak] = useLiveMessage();
 *   ...
 *   <button onClick={() => speak("Hello World")}>Click me</button>
 */
export const useLiveMessage = () => {
  const { messageLow, messageHigh, setMessageLow, setMessageHigh } = useContext(LiveMessageContext);
  const { localizeField, translationLanguagePriority } = useTemplateStore((s) => ({
    localizeField: s.localizeField,
    translationLanguagePriority: s.translationLanguagePriority,
  }));
  const { t } = useTranslation();

  /**
   * Updates the app-wide live-region with the passed in content to be announced by AT.
   * @param message text content to be announced
   * @param priority ARIA live region priority. Use HIGH sparingly e.g. an imporatnt error message
   * @param delayInSeconds by default announces after next-tick-ish to avoid react hydration issue.
   */
  function speak(
    message: string = "",
    priority: Priority = Priority.LOW,
    delayInSeconds: number = 40
  ) {
    setTimeout(() => {
      if (priority === Priority.LOW && messageLow !== message) {
        logMessage.info(`LiveMessage announcing: ${message}`);
        setMessageLow(message);
      } else if (priority === Priority.HIGH && messageHigh !== message) {
        logMessage.info(`LiveMessage announcing (high): ${message}`);
        setMessageHigh(message);
      }
    }, delayInSeconds);
  }

  //
  //
  // TRYING SOMETHING
  //
  //
  // TODO Try with events next

  const getConditionalActivatedString = (element: FormElement) => {
    return t("conditional.activated", {
      name: element.properties[
        localizeField(LocalizedElementProperties.TITLE, translationLanguagePriority)
      ],
    });
  };

  const getDynamicRowAddedString = ({ title, count }: { title: string; count: number }) => {
    return t("dynamicRow.addedMessage", { title, count });
  };

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const getMessage = (key: string, obj: any) => {
    // TODO generic  for type?
    try {
      switch (key) {
        case "conditionalActivated":
          return getConditionalActivatedString(obj);
        case "DynamicRowAdded":
          return getDynamicRowAddedString(obj);
        default:
          return "";
      }
    } catch (e) {
      logMessage.error("Error looking up live message");
    }
  };

  // TODO better name please!
  function speakByKey(key: string, obj: any) {
    // TODO generic  for type?
    const message = getMessage(key, obj);

    if (message) {
      speak(message);
    }
  }

  return { speak, speakByKey };
};

// Or what if each message was a separate function / thing?

// Or try old way, but  as a returned component :)

// Or would moving the string translation bit out into another file help?
