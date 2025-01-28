import { FormElement } from "@cdssnc/gcforms-types";
import { truncateString } from "@lib/client/clientHelpers";
import { EventKeys, useCustomEvent } from "@lib/hooks/useCustomEvent";
import { getProperty } from "@lib/i18nHelpers";
import { useRef } from "react";
import { useTranslation } from "react-i18next";

// Component created to  keep all the translation related and event code separate
export const Announce = ({
  children,
  element,
  lang,
}: {
  children: React.ReactNode;
  element: FormElement;
  lang: string;
}) => {
  const { t } = useTranslation();
  const { Event } = useCustomEvent();
  const messageRef = useRef("");

  const maxTitleLength = 25;

  messageRef.current = t("conditional.activated", {
    title: truncateString(String(element?.properties[getProperty("title", lang)]), maxTitleLength),
    lng: lang,
  });
  if (messageRef.current !== "") {
    Event.fire(EventKeys.liveMessage, { message: messageRef.current });
  }

  if (!children) {
    return null;
  }

  return children;
};
