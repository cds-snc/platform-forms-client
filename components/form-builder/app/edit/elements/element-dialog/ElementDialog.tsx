import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "next-i18next";
import { FormElementTypes } from "@lib/types";
import { useDialogRef, Dialog, ListBox } from "../../../shared";
import { useElementOptions } from "../../../../hooks";
import { ElementOption, ElementOptionsFilter } from "../../../../types";
import { Button } from "@components/globals";
import { Groups } from "@components/form-builder/hooks/useElementOptions";
import { ElementFilters } from "./ElementFilters";

const Header = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="absolute top-0 z-[1000] min-h-[60px] w-full border-b border-slate-800 bg-violet-100 p-4">
      {children}
    </div>
  );
};

const Body = ({ children }: { children: React.ReactNode }) => {
  return <div className="flex py-[70px]">{children}</div>;
};

const Footer = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="absolute bottom-0 flex min-h-[60px] w-full gap-4 border-t border-slate-800 bg-white p-4">
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

  const [selectedGroups, setSelectedGroups] = useState<Groups[]>([]);

  const filterElementsByGroup = (elements: ElementOption[]) => {
    if (selectedGroups.length === 0) {
      return elements;
    }

    return elements.filter((element) => selectedGroups.includes(element.group.id as Groups));
  };

  // @TODO: This is only applying one filter or the other, need to apply both
  const elementOptions = useElementOptions(filterElements ? filterElements : filterElementsByGroup);

  const [selected, setSelected] = useState(0);

  const handleChange = useCallback(
    (val: number) => {
      setSelected(val);
    },
    [setSelected]
  );

  const id = elementOptions[selected].id as FormElementTypes;
  const value = elementOptions[selected].value;
  const Description = elementOptions[selected].description;

  const handleAdd = useCallback(() => {
    handleAddType && handleAddType(id);
    handleClose();
  }, [handleClose, handleAddType, id]);

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
    <Dialog dialogRef={dialog} handleClose={handleClose} className="max-w-[800px]">
      <div className="relative">
        <Header>
          <h4>Add elements to your page</h4>
          <ElementFilters setSelectedGroups={setSelectedGroups} selectedGroups={selectedGroups} />
        </Header>

        <Body>
          {/* SIDEBAR */}
          <div className="max-h-[630px] w-1/3 overflow-y-scroll pt-16">
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
            />
          </div>
          {/* /SIDEBAR */}

          {/* DESCRIPTION */}
          <div className="max-h-[630px] w-2/3 overflow-y-scroll bg-slate-100 px-4 pb-8 pt-16">
            <div role="region" aria-label={`${value} ${t("addElementDialog.example")}`} id={id}>
              <div data-testid="element-description-content">
                <Description
                  title={t(`addElementDialog.${id}.title`)}
                  description={t(`addElementDialog.${id}.description`)}
                />
              </div>
            </div>
          </div>
          {/* /DESCRIPTION */}
        </Body>

        <Footer>
          <Button dataTestId="element-description-add-element" onClick={handleAdd}>
            {t("addElementDialog.addButton")}
          </Button>
          <Button theme="secondary" dataTestId="cancel-button" onClick={handleClose}>
            Cancel
          </Button>
        </Footer>
      </div>
    </Dialog>
  );
};
