import { FormElement } from "@cdssnc/gcforms-types";
import { useTranslation } from "@i18n/client";
import { EventKeys, useCustomEvent } from "@lib/hooks/useCustomEvent";
import { logMessage } from "@lib/logger";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { LocalizedElementProperties } from "@lib/types/form-builder-types";
import { useCallback, useEffect, useState } from "react";

export enum Priority {
  LOW = "polite",
  HIGH = "assertive",
}

export interface Message {
  message: string;
  priority?: Priority;
}

export const LiveRegion = () => {
  const { Event } = useCustomEvent();
  const { localizeField, translationLanguagePriority } = useTemplateStore((s) => ({
    localizeField: s.localizeField,
    translationLanguagePriority: s.translationLanguagePriority,
  }));
  const { t } = useTranslation();

  const [messageLow, setMessageLow] = useState<string>("");
  const [messageHigh, setMessageHigh] = useState<string>("");



  // /////////////////////////////
  // const getConditionalActivatedString = (element: FormElement) => {
  //   return t("conditional.activated", {
  //     name: element.properties[
  //       localizeField(LocalizedElementProperties.TITLE, translationLanguagePriority)
  //     ],
  //   });
  // };

  // const getDynamicRowAddedString = ({ title, count }: { title: string; count: number }) => {
  //   return t("dynamicRow.addedMessage", { title, count });
  // };

  // /* eslint-disable @typescript-eslint/no-explicit-any */
  // const getMessage = (key: string, obj: any) => {
  //   // TODO generic  for type?
  //   try {
  //     switch (key) {
  //       case "conditionalActivated":
  //         return getConditionalActivatedString(obj);
  //       case "DynamicRowAdded":
  //         return getDynamicRowAddedString(obj);
  //       default:
  //         return "";
  //     }
  //   } catch (e) {
  //     logMessage.error("Error looking up live message");
  //   }
  // };
  // /////////////////////////////



  const speak = useCallback((detail: Message) => {
    if (!detail) { return; }

    if (detail.priority === Priority.HIGH) {
      return setMessageHigh(detail.message);
    }

    setMessageLow(detail.message);
  }, []);

  // const speakByKey = useCallback((detail: Message) => {
  //   if (!detail || !detail.message) { return; }
  //   const message = getMessage(detail.key, detail.obj);
  //   if (detail.priority === Priority.HIGH) {
  //     return setMessageHigh(message);
  //   }
  //   setMessageLow(message);
  // }, []);

  useEffect(() => {
    Event.on(EventKeys.liveMessage, speak);
    // Event.on(EventKeys.liveMessageKey, speakByKey);

    return () => {
      Event.off(EventKeys.liveMessage, speak);
      // Event.off(EventKeys.liveMessageKey, speakByKey);
    };
  }, [Event, speak, speakByKey]);


  // Prime the live regions and add redundant aria-live attribute for best AT support
  return (
    <>
      <div role="status" aria-live="polite" className="sr-only">{messageLow}</div>
      <div role="alert" aria-live="assertive" className="sr-only">{messageHigh}</div>
    </>
  );
}
