import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "@i18n/client";
import { FormElementTypes } from "@lib/types";
import {
  useDialogRef,
  Dialog,
  ListBox,
} from "../../../../../../../../../../components/clientComponents/form-builder/app/shared";
import { useElementOptions } from "../../../../../../../../../../components/clientComponents/form-builder/hooks";
import {
  ElementOption,
  ElementOptionsFilter,
} from "../../../../../../../../../../components/clientComponents/form-builder/types";
import { Button } from "@clientComponents/globals";
import { Groups } from "@clientComponents/form-builder/hooks/useElementOptions";
import { ElementFilters } from "./ElementFilters";

export type SelectedGroupState = {
  group: Groups | "all";
  ref: React.RefObject<HTMLElement>;
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

const Footer = ({ children }: { children: React.ReactNode }) => {
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

  // Retain focus on selected filter on change
  useEffect(() => {
    if (selectedGroup.ref.current) {
      selectedGroup.ref.current.focus();
    }
    setSelectedElement(0);
  }, [selectedGroup]);

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

  return (
    <Dialog dialogRef={dialog} handleClose={handleClose} className="flex max-w-[800px]">
      <div className="relative flex w-full">
        <Header>
          <h4>{t("addElement")}</h4>
          <ElementFilters
            setSelectedGroup={setSelectedGroup}
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

        <Footer>
          <Button dataTestId="element-description-add-element" onClick={handleAdd}>
            <>
              {id
                ? `${t(`addElementDialog.addElement.${id}`)}`
                : `{t("addElementDialog.addButton")}`}
            </>
          </Button>
          <Button theme="secondary" dataTestId="cancel-button" onClick={handleClose}>
            {t("addElementDialog.cancel")}
          </Button>
        </Footer>
      </div>
    </Dialog>
  );
};
