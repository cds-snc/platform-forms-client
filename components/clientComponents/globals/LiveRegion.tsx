import { FormElement } from "@cdssnc/gcforms-types";
import { useTranslation } from "@i18n/client";
import { EventKeys, useCustomEvent } from "@lib/hooks/useCustomEvent";
import { logMessage } from "@lib/logger";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { LocalizedElementProperties } from "@lib/types/form-builder-types";
import { useCallback, useEffect, useRef } from "react";

// TODO:
// -clean up getMessage stuff

export enum Priority {
  LOW = "polite",
  HIGH = "assertive",
}

export interface Message {
  message: string;
  priority?: Priority;
}

export const LiveRegion = () => {
  const { localizeField, translationLanguagePriority } = useTemplateStore((s) => ({
    localizeField: s.localizeField,
    translationLanguagePriority: s.translationLanguagePriority,
  }));
  const { t } = useTranslation();
  const { Event } = useCustomEvent();

  // Use refs to avoid unnecessary rerenders of this component
  const messageLowRef = useRef<HTMLDivElement>(null);
  const messageHighRef = useRef<HTMLDivElement>(null);

  const livePolite = (message: string) => {
    if (!messageLowRef.current || messageLowRef.current.textContent === message) {
      return;
    }
    logMessage.info(`speak: ${message}`);
    messageLowRef.current.textContent = message;
  };

  // TODO role=alert seems to have trouble queuing updates, come back to this
  const liveAssertive = (message: string) => {
    if (!messageHighRef.current || messageHighRef.current.textContent === message) {
      return;
    }
    logMessage.info(`speak (high priority): ${message}`);
    messageHighRef.current.textContent = message + Date.now();
  };

  const speak = useCallback((detail: Message) => {
    if (!detail) {
      return;
    }

    if (detail.priority === Priority.HIGH) {
      liveAssertive(detail.message);
    } else {
      livePolite(detail.message);
    }
  }, []);

  //////////////////////////////////////////////////
  const getConditionalActivatedString = useCallback(
    (element: FormElement) => {
      return t("conditional.activated", {
        name: element.properties[
          localizeField(LocalizedElementProperties.TITLE, translationLanguagePriority)
        ],
      });
    },
    [t, localizeField, translationLanguagePriority]
  );

  const getDynamicRowAddedString = useCallback(
    ({ title, count }: { title: string; count: number }) => {
      return t("dynamicRow.addedMessage", { title, count });
    },
    [t]
  );

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const getMessage = useCallback(
    (key: string, obj: any) => {
      // TODO generic  for type?
      try {
        switch (key) {
          case "conditionalActivated":
            return getConditionalActivatedString(obj);
          case "dynamicRowAdded":
            return getDynamicRowAddedString(obj);
          default:
            return "";
        }
      } catch (e) {
        logMessage.error("Error looking up live message");
        return "";
      }
    },
    [getConditionalActivatedString, getDynamicRowAddedString]
  );

  const speakObject = useCallback(
    (detail: any) => {
      if (!detail || !detail.key) {
        return;
      }
      const message = getMessage(detail.key, detail.obj);
      speak({ message, priority: detail.priority });
    },
    [getMessage, speak]
  );
  //////////////////////////////////////////////////

  useEffect(() => {
    Event.on(EventKeys.liveMessage, speak);
    Event.on(EventKeys.liveMessageObject, speakObject);

    return () => {
      Event.off(EventKeys.liveMessage, speak);
      Event.off(EventKeys.liveMessageObject, speakObject);
    };
  }, [Event, speak, getMessage, speakObject]);

  // Prime the live regions and add redundant aria-live attribute for best AT support
  return (
    <>
      <div role="status" aria-live="polite" className="sr-only" ref={messageLowRef}></div>
      <div role="alert" aria-live="assertive" className="sr-only" ref={messageHighRef}></div>
    </>
  );
};
