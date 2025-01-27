import { FormElement } from "@cdssnc/gcforms-types";
import { EventKeys, useCustomEvent } from "@lib/hooks/useCustomEvent";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { LocalizedElementProperties } from "@lib/types/form-builder-types";
import { useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";

export const Announce = ({
  children,
  element,
}: {
  children: React.ReactNode;
  element: FormElement;
}) => {
  const { t } = useTranslation();
  const { localizeField, translationLanguagePriority } = useTemplateStore((s) => ({
    localizeField: s.localizeField,
    translationLanguagePriority: s.translationLanguagePriority,
  }));
  const { Event } = useCustomEvent();
  const messageRef = useRef("");

  const getConditionalActivatedString = useCallback(
    (element: FormElement) => {
      return t("conditional.activated", {
        name: element?.properties[
          localizeField(LocalizedElementProperties.TITLE, translationLanguagePriority)
        ],
      });
    },
    [t, localizeField, translationLanguagePriority]
  );

  messageRef.current = getConditionalActivatedString(element);

  if (messageRef.current !== "") {
    Event.fire(EventKeys.liveMessage, { message: messageRef.current });
  }

  if (!children) {
    return null;
  }

  return children;
};
