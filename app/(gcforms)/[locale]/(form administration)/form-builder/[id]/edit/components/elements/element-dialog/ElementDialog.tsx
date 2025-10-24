import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "@i18n/client";
import { FormElementTypes } from "@lib/types";
import { useElementOptions } from "@lib/hooks/form-builder/useElementOptions";
import { ElementOption, ElementOptionsFilter } from "@lib/types/form-builder-types";
import { Button } from "@clientComponents/globals";
import { Groups } from "@lib/hooks/form-builder/useElementOptions";
import { ElementFilters } from "./ElementFilters";
import { Dialog, useDialogRef } from "@formBuilder/components/shared/Dialog";
import { ListBox } from "@formBuilder/components/shared/ListBox";

import { useFormBuilderConfig } from "@lib/hooks/useFormBuilderConfig";

export type SelectedGroupState = {
  group: Groups | "all";
  ref: React.RefObject<HTMLElement | null>;
};

const filterElementsByGroup = (elements: ElementOption[], selectedGroup: Groups | "all") => {
  if (selectedGroup === "all") {
    return elements;
  }

  return elements.filter((element) => selectedGroup === element.group.id);
};

const Header = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="absolute top-0 z-[1000] min-h-[60px] w-full border-b border-slate-800 bg-violet-100 p-4">
      {children}
    </div>
  );
};

const Body = ({ children }: { children: React.ReactNode }) => {
  return <div className="flex w-full py-[70px]">{children}</div>;
};

const ElementDialogFooter = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="absolute bottom-0 z-[100] flex min-h-[60px] w-full gap-4 border-t border-slate-800 bg-white p-4">
      {children}
    </div>
  );
};

export const ElementDialog = ({
  handleAddType,
  handleClose,
  filterElements,
}: {
  handleAddType?: (type?: FormElementTypes) => void;
  handleClose: () => void;
  filterElements?: ElementOptionsFilter;
}) => {
  const { t } = useTranslation("form-builder");
  const dialog = useDialogRef();
  const descriptionRef = useRef<HTMLDivElement>(null);
  const [selectedElement, setSelectedElement] = useState(0);
  const [selectedGroup, setSelectedGroup] = useState<SelectedGroupState>({
    group: "all",
    ref: React.createRef<HTMLElement>(),
  });

  // Retrieve elements applying any initial filters
  const filteredElements = useElementOptions(filterElements);

  // Retrieve a list of active groups after filtering
  const activeGroups = Array.from(
    new Set(filteredElements.map((element) => element.group.id))
  ) as Groups[];

  // Now filter by selected group
  const elementOptions = filterElementsByGroup(filteredElements, selectedGroup.group);

  const handleChange = useCallback(
    (val: number) => {
      setSelectedElement(val);
    },
    [setSelectedElement]
  );

  const handleGroupChange = useCallback(
    (
      newGroupOrUpdater: SelectedGroupState | ((prev: SelectedGroupState) => SelectedGroupState)
    ) => {
      const newGroup =
        typeof newGroupOrUpdater === "function"
          ? newGroupOrUpdater(selectedGroup)
          : newGroupOrUpdater;
      setSelectedGroup(newGroup);
      setSelectedElement(0);
      // Focus the new group element immediately when selection changes
      if (newGroup.ref.current) {
        newGroup.ref.current.focus();
      }
    },
    [selectedGroup]
  );

  let id: FormElementTypes | undefined;
  let value = "";
  let Description = null;

  if (elementOptions[selectedElement]) {
    id = elementOptions[selectedElement].id as FormElementTypes;
    value = elementOptions[selectedElement].value;
    Description = elementOptions[selectedElement].description;
  }

  const handleAdd = useCallback(() => {
    handleAddType && handleAddType(id);
    handleClose();
  }, [handleClose, handleAddType, id]);

  useEffect(() => {
    if (descriptionRef.current) {
      descriptionRef.current.scrollTop = 0;
    }
  }, [descriptionRef, selectedElement]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.stopPropagation();
        handleAdd();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleAdd]);

  const { hasApiKeyId } = useFormBuilderConfig();

  // Check if the file input should be disabled
  // In this case, it should only be enabled if the form has an API key
  const disabled = id === "fileInput" && !hasApiKeyId;

  return (
    <Dialog dialogRef={dialog} handleClose={handleClose} className="flex max-w-[800px]">
      <div className="relative flex w-full">
        <Header>
          <h4>{t("addElement")}</h4>
          <ElementFilters
            setSelectedGroup={handleGroupChange}
            selectedGroup={selectedGroup}
            activeGroups={activeGroups}
          />
        </Header>

        <Body>
          {/* SIDEBAR */}
          <div className="mt-14 w-1/3 overflow-y-scroll">
            <ListBox
              ariaLabel={t("addElementDialog.questionElement")}
              options={elementOptions.map(({ id, value, group, className, icon }) => ({
                id: id as string,
                value,
                group,
                className,
                icon,
              }))}
              handleChange={handleChange}
              selectedGroup={selectedGroup}
            />
          </div>
          {/* /SIDEBAR */}

          {/* DESCRIPTION */}
          <div
            className="mt-14 w-2/3 overflow-y-scroll bg-slate-100 px-4 pb-8 pt-2"
            ref={descriptionRef}
          >
            <div role="region" aria-label={`${value} ${t("addElementDialog.example")}`} id={id}>
              <div data-testid="element-description-content" aria-live="polite">
                {Description && (
                  <Description
                    title={t(`addElementDialog.${id}.title`)}
                    description={t(`addElementDialog.${id}.description`)}
                  />
                )}
              </div>
            </div>
          </div>
          {/* /DESCRIPTION */}
        </Body>

        <ElementDialogFooter>
          <Button
            disabled={disabled}
            dataTestId="element-description-add-element"
            onClick={handleAdd}
          >
            <>
              {id
                ? `${t(`addElementDialog.addElement.${id}`)}`
                : `{t("addElementDialog.addButton")}`}
            </>
          </Button>
          <Button theme="secondary" dataTestId="cancel-button" onClick={handleClose}>
            {t("addElementDialog.cancel")}
          </Button>
        </ElementDialogFooter>
      </div>
    </Dialog>
  );
};
