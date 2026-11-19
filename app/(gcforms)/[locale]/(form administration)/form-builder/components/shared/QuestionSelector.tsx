"use client";

import { type ReactNode, useMemo, useState } from "react";
import { useTranslation } from "@i18n/client";
import { SearchSelector } from "@clientComponents/forms/SearchSelector/SearchSelector";
import { FormElement } from "@lib/types";
import { LocalizedElementProperties, LocalizedFormProperties } from "@lib/types/form-builder-types";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { useGroupStore } from "@lib/groups/useGroupStore";
import { toPlainText } from "@lib/utils/strings";
import { cn } from "@lib/utils";

export type QuestionSearchResult = {
  element: FormElement;
  groupId: string;
  groupName: string;
  label: string;
};

export type GroupSearchResult = {
  groupId: string;
  groupName: string;
  label: string;
};

export type QuestionSelectorType = "questions" | "groups";
export type SelectorResult = QuestionSearchResult | GroupSearchResult;

const renderHighlightedLabel = (label: string, searchTerm: string) => {
  const normalizedSearchTerm = searchTerm.trim();
  if (!normalizedSearchTerm) return label;

  const escapedSearchTerm = normalizedSearchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = label.split(new RegExp(`(${escapedSearchTerm})`, "gi"));

  return parts.map((part, index) =>
    part.toLocaleLowerCase() === normalizedSearchTerm.toLocaleLowerCase() ? (
      <span className="text-black" key={`${part}-${index}`}>
        {part}
      </span>
    ) : (
      <span key={`${part}-${index}`}>{part}</span>
    )
  );
};

export const useQuestionSelector = (
  type: QuestionSelectorType = "questions",
  initialValue: string | SelectorResult | null = null,
  onResult?: (result: SelectorResult) => void,
  excludeIds: number[] = []
) => {
  const { t } = useTranslation("form-builder");
  const { localizeField, translationLanguagePriority, formElements, changeKey } = useTemplateStore(
    (s) => ({
      localizeField: s.localizeField,
      translationLanguagePriority: s.translationLanguagePriority,
      formElements: s.form.elements || [],
      changeKey: s.changeKey,
    })
  );
  const getGroups = useGroupStore((state) => state.getGroups);
  const getElement = useGroupStore((state) => state.getElement);
  const searchResults = useMemo<SelectorResult[]>(() => {
    const groups = getGroups() || {};
    if (type === "groups") {
      const groupTitleKey = localizeField("title", translationLanguagePriority);

      return Object.entries(groups).map(([groupId, group]) => ({
        groupId,
        groupName: group.name,
        label: (groupTitleKey === "titleEn" ? group.titleEn : group.titleFr) || group.name,
      }));
    }

    const titleKey = localizeField(LocalizedFormProperties.TITLE, translationLanguagePriority);
    const descriptionKey = localizeField(
      LocalizedElementProperties.DESCRIPTION,
      translationLanguagePriority
    );

    return Object.entries(groups).flatMap(([groupId, group]) =>
      group.elements.flatMap((elementId) => {
        const element = getElement(Number(elementId));
        if (!element || element.type === "richText" || excludeIds.includes(element.id)) return [];

        const title = element.properties[titleKey] || "";
        const description = element.properties[descriptionKey] || "";
        const label = title || toPlainText(description);
        if (!label) return [];

        return [
          {
            element,
            groupId,
            groupName: group.name,
            label,
          },
        ];
      })
    );
    // changeKey tracks template updates that affect question labels or group membership.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    changeKey,
    getElement,
    getGroups,
    localizeField,
    translationLanguagePriority,
    formElements,
    type,
    excludeIds,
  ]);

  const initialSelectedQuestion =
    typeof initialValue === "string"
      ? (searchResults.find(
          (result) => "element" in result && String(result.element.id) === initialValue
        ) ?? null)
      : initialValue;
  const [selectedQuestion, setSelectedQuestion] = useState<SelectorResult | null>(
    initialSelectedQuestion
  );

  const handleSearchResult = (result: SelectorResult) => {
    setSelectedQuestion(result);
    onResult?.(result);
  };

  return {
    searchResults,
    selectedQuestion,
    handleSearchResult,
    label: t("questionSearch.label"),
    placeholder: t("questionSearch.placeholder"),
    noResultsMessage: t("questionSearch.noResults"),
  };
};

export const QuestionSelector = ({
  type = "questions",
  initialValue,
  onResult,
  excludeIds,
  label: labelOverride,
  className,
}: {
  type?: QuestionSelectorType;
  initialValue?: string | SelectorResult | null;
  onResult?: (result: SelectorResult) => void;
  excludeIds?: number[];
  label?: ReactNode;
  className?: string;
}) => {
  const {
    searchResults,
    selectedQuestion,
    handleSearchResult,
    label,
    placeholder,
    noResultsMessage,
  } = useQuestionSelector(type, initialValue, onResult, excludeIds);

  return (
    <div className={cn("my-6 max-w-[800px]", className)}>
      <SearchSelector
        items={searchResults}
        selectedItem={selectedQuestion}
        onResult={handleSearchResult}
        getItemKey={(result) => ("element" in result ? result.element.id : result.groupId)}
        getItemLabel={(result) => result.label}
        renderResult={(result, { searchTerm }) => (
          <div
            className="flex flex-col gap-1"
            data-element-id={"element" in result ? result.element.id : undefined}
          >
            <span className="text-slate-500">
              {renderHighlightedLabel(result.label, searchTerm)}
            </span>
            {"element" in result && <span className="text-slate-600">{result.groupName}</span>}
          </div>
        )}
        renderSelectedItem={(result) => (
          <div
            className="flex flex-col gap-1"
            data-element-id={"element" in result ? result.element.id : undefined}
          >
            <span>{result.label}</span>
            {"element" in result && <span className="text-slate-700">{result.groupName}</span>}
          </div>
        )}
        leadingIcon={<SearchIcon />}
        label={labelOverride ?? label}
        placeholder={placeholder}
        noResultsMessage={noResultsMessage}
      />
    </div>
  );
};

const SearchIcon = () => (
  <svg
    width="30"
    height="30"
    aria-hidden="true"
    className="h-[30px] w-[30px]"
    fill="none"
    viewBox="0 0 30 30"
  >
    <path
      d="M22.6 24.0001L16.3 17.7001C15.8 18.1001 15.2267 18.4167 14.58 18.6501C13.9333 18.8834 13.24 19.0001 12.5 19.0001C10.6867 19.0001 9.15 18.3701 7.89 17.1101C6.63 15.8567 6 14.3201 6 12.5001C6 10.6801 6.63 9.14339 7.89 7.89005C9.15 6.63672 10.6867 6.00672 12.5 6.00005C14.3133 5.99339 15.85 6.62339 17.11 7.89005C18.37 9.15672 19 10.6934 19 12.5001C19 13.2334 18.8833 13.9234 18.65 14.5701C18.4167 15.2167 18.1 15.7934 17.7 16.3001L24 22.6001L22.6 24.0001ZM12.5 17.0001C13.7533 17.0001 14.8167 16.5634 15.69 15.6901C16.5633 14.8167 17 13.7534 17 12.5001C17 11.2467 16.5633 10.1834 15.69 9.31005C14.8167 8.43672 13.7533 8.00005 12.5 8.00005C11.2467 8.00005 10.1833 8.43672 9.31 9.31005C8.43667 10.1834 8 11.2467 8 12.5001C8 13.7534 8.43667 14.8167 9.31 15.6901C10.1833 16.5634 11.2467 17.0001 12.5 17.0001Z"
      fill="#4338CA"
    />
  </svg>
);
