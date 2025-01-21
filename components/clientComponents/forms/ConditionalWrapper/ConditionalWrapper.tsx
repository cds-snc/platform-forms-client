"use client";
import React from "react";
import { useGCFormsContext } from "@lib/hooks/useGCFormContext";
import { ConditionalRule, FormElement } from "@lib/types";
import { inGroup, validConditionalRules, checkRelatedRulesAsBoolean } from "@lib/formContext";
import { useTranslation } from "@i18n/client";
import { useLiveMessage } from "@lib/hooks/useLiveMessage";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { LocalizedElementProperties } from "@lib/types/form-builder-types";

export const ConditionalWrapper = ({
  children,
  element,
  rules,
}: {
  children: React.ReactElement;
  element: FormElement;
  rules: ConditionalRule[] | null;
}) => {
  const { matchedIds, currentGroup, groups, formRecord } = useGCFormsContext();
  const { localizeField, translationLanguagePriority } = useTemplateStore((s) => ({
    localizeField: s.localizeField,
    translationLanguagePriority: s.translationLanguagePriority,
  }));
  const { t } = useTranslation();
  const [speak] = useLiveMessage();

  // Check if the element is a child of a dynamic element
  if (element.subId) {
    return children;
  }

  // Check if we're using groups and if the current element is in a group
  if (
    currentGroup &&
    groups &&
    Object.keys(groups).length >= 1 &&
    groups &&
    !inGroup(currentGroup, element.id, groups)
  )
    return null;

  // If there's no rule or no choiceId, just return the children
  if (!rules || rules.length < 1) return children;

  const hasMatchedRule = validConditionalRules(element, matchedIds);

  if (hasMatchedRule) {
    // Ensure rules for elements tied to the element are also matched.
    if (checkRelatedRulesAsBoolean(formRecord.form.elements, rules, matchedIds)) {
      speak(
        t("conditional.activated", {
          name: element.properties[
            localizeField(LocalizedElementProperties.TITLE, translationLanguagePriority)
          ],
        })
      );
      return children;
    }
  }

  // Otherwise, return null
  return null;
};
