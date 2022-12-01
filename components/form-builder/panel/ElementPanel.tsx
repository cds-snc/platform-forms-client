import React, { useState, useCallback, useEffect } from "react";
import debounce from "lodash.debounce";
import styled from "styled-components";
import PropTypes from "prop-types";
import { useTranslation } from "next-i18next";

import {
  ElementOption,
  FormElementWithIndex,
  LocalizedElementProperties,
  LocalizedFormProperties,
} from "../types";
import { useTemplateStore, useModalStore } from "../store/";
import { UseSelectStateChange } from "downshift";
import {
  PanelActions,
  ConfirmationDescription,
  PrivacyDescription,
  QuestionInput,
  ModalButton,
  ModalForm,
  SelectedElement,
  getSelectedOption,
} from "./";
import { RichTextLocked, Select } from "../elements";
import { useElementOptions } from "../hooks";
import { Checkbox, Button, Input } from "../shared";

interface RowProps {
  isRichText: boolean;
}

const Row = styled.div<RowProps>`
  display: flex;
  justify-content: space-between;
  position: relative;
  font-size: 16px;
  & > div {
    ${({ isRichText }) =>
      isRichText &&
      `
      width: 100%;
      margin: 0;
      font-size: 1.25em;
    `}
  }
`;

const DivDisabled = styled.div`
  margin-top: 20px;
  padding: 5px 10px;
  width: 100%;
  cursor: not-allowed;
  border-radius: 4px;
  background: #f2f2f2;
  color: #6e6e6e;
`;

const FormLabel = styled.label`
  font-weight: 700;
  display: block;
  margin-bottom: 3px;
`;

const LabelHidden = styled(FormLabel)`
  /* same as .sr-only */
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
`;

const RequiredWrapper = styled.div`
  margin-top: 20px;

  span {
    display: inline-block;
    margin-left: 10px;
  }

  label {
    padding-top: 4px;
  }
`;

const Form = ({ item }: { item: FormElementWithIndex }) => {
  const isRichText = item.type == "richText";
  const { t } = useTranslation("form-builder");
  const elementOptions = useElementOptions();
  const { localizeField, elements, updateField, unsetField, resetChoices } = useTemplateStore(
    (s) => ({
      localizeField: s.localizeField,
      elements: s.form.elements,
      updateField: s.updateField,
      unsetField: s.unsetField,
      resetChoices: s.resetChoices,
    })
  );

  const questionNumber =
    elements
      .filter((item) => item.type != "richText")
      .findIndex((object) => object.id === item.id) + 1;

  const [selectedItem, setSelectedItem] = useState<ElementOption>(getSelectedOption(item));

  const _updateState = (id: string, index: number) => {
    switch (id) {
      case "text":
      case "textField":
      case "email":
      case "phone":
      case "date":
      case "number":
        updateField(`form.elements[${index}].type`, "textField");

        if (id === "textField" || id === "text") {
          unsetField(`form.elements[${index}].properties.validation.type`);
        } else {
          updateField(`form.elements[${index}].properties.validation.type`, id);
          unsetField(`form.elements[${index}].properties.validation.maxLength`);
        }
        break;
      case "richText":
        resetChoices(index);
      // no break here (we want default to happen)
      default: // eslint-disable-line no-fallthrough
        updateField(`form.elements[${index}].type`, id);
        unsetField(`form.elements[${index}].properties.validation.type`);
        unsetField(`form.elements[${index}].properties.validation.maxLength`);
        break;
    }
  };

  const handleElementChange = useCallback(
    ({ selectedItem }: UseSelectStateChange<ElementOption | null | undefined>) => {
      if (selectedItem) {
        setSelectedItem(selectedItem);
        _updateState(selectedItem.id, item.index);
      }
    },
    [setSelectedItem]
  );

  const hasDescription = item.properties[localizeField(LocalizedElementProperties.DESCRIPTION)];

  return (
    <>
      <Row isRichText={isRichText} className="element-panel flex xxl:flex-col-reverse flex-row">
        <div className={isRichText ? undefined : "basis-[460px] xxl:basis-[10px] mr-5"}>
          {!isRichText && (
            <>
              <span
                className={`absolute left-0 bg-gray-default py-2.5 rounded-r -ml-7 ${
                  item.index < 9 ? "px-1.5" : "pl-0.5 pr-1 tracking-tighter"
                }`}
              >
                {questionNumber}
              </span>
              <LabelHidden htmlFor={`item${item.index}`}>
                {t("question")} {item.index + 1}
              </LabelHidden>
              <QuestionInput
                initialValue={item.properties[localizeField(LocalizedElementProperties.TITLE)]}
                index={item.index}
                hasDescription={hasDescription}
              />
            </>
          )}
          {hasDescription && item.type !== "richText" && (
            <DivDisabled id={`item${item.index}-describedby`}>
              {item.properties[localizeField(LocalizedElementProperties.DESCRIPTION)]}
            </DivDisabled>
          )}
          <SelectedElement item={item} selected={selectedItem} />
          {item.properties.validation?.maxLength && (
            <DivDisabled>
              {t("maxCharacterLength")}
              {item.properties.validation?.maxLength}
            </DivDisabled>
          )}
        </div>
        {!isRichText && (
          <>
            <div>
              <Select
                options={elementOptions}
                selectedItem={selectedItem}
                onChange={handleElementChange}
              />
              <RequiredWrapper>
                <Checkbox
                  id={`required-${item.index}-id`}
                  value={`required-${item.index}-value`}
                  checked={item.properties.validation?.required}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    if (!e.target) {
                      return;
                    }

                    updateField(
                      `form.elements[${item.index}].properties.validation.required`,
                      e.target.checked
                    );
                  }}
                  label={t("required")}
                ></Checkbox>
              </RequiredWrapper>
            </div>
          </>
        )}
      </Row>
    </>
  );
};

Form.propTypes = {
  item: PropTypes.object,
};

const ElementWrapperDiv = styled.div`
  border: 1.5px solid #000000;
  max-width: 800px;
  height: auto;
  margin-top: -1px;
`;

export const ElementWrapper = ({ item }: { item: FormElementWithIndex }) => {
  const { t } = useTranslation("form-builder");
  const isRichText = item.type == "richText";
  const { elements, getFocusInput, updateField } = useTemplateStore((s) => ({
    updateField: s.updateField,
    elements: s.form.elements,
    getFocusInput: s.getFocusInput,
  }));

  const { isOpen, modals, updateModalProperties, unsetModalField } = useModalStore();

  const [className, setClassName] = useState<string>("");
  const [ifFocus, setIfFocus] = useState<boolean>(false);

  if (ifFocus === false) {
    // Only run this 1 time
    setIfFocus(true);

    // getFocusInput is only ever true if we press "duplicate" or "add question"
    if (getFocusInput()) {
      setClassName(
        "bg-yellow-100 transition-colors ease-out duration-[1500ms] delay-500 outline-[2px] outline-blue-focus outline"
      );
    }
  }

  useEffect(() => {
    // remove the yellow background immediately, CSS transition will fade the colour
    setClassName(className.replace("bg-yellow-100 ", ""));
    // remove the blue outline after 2.1 seconds
    setTimeout(() => setClassName(""), 2100);
  }, [getFocusInput]);

  useEffect(() => {
    if (item.type != "richText") {
      updateModalProperties(item.index, elements[item.index].properties);
    }
  }, [item, isOpen, isRichText]);

  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  const handleSubmit = ({ item, properties }: { item: FormElementWithIndex; properties: any }) => {
    return (e: React.MouseEvent<HTMLElement>) => {
      e.preventDefault();
      // replace all of "properties" with the new properties set in the ModalForm
      updateField(`form.elements[${item.index}].properties`, properties);
    };
  };

  return (
    <ElementWrapperDiv className={`element-${item.index} ${className}`}>
      <div className={isRichText ? "mt-7" : "mx-7 my-7"}>
        <Form item={item} />
      </div>
      <PanelActions
        item={item}
        renderSaveButton={() => (
          <ModalButton isOpenButton={false}>
            {modals[item.index] && (
              <Button
                className="mr-4"
                onClick={handleSubmit({ item, properties: modals[item.index] })}
              >
                {t("save")}
              </Button>
            )}
          </ModalButton>
        )}
      >
        {!isRichText && modals[item.index] && (
          <ModalForm
            item={item}
            properties={modals[item.index]}
            updateModalProperties={updateModalProperties}
            unsetModalField={unsetModalField}
          />
        )}
      </PanelActions>
    </ElementWrapperDiv>
  );
};

export const ElementPanel = () => {
  const { t } = useTranslation("form-builder");
  const { title, elements, introduction, endPage, privacyPolicy, localizeField, updateField } =
    useTemplateStore((s) => ({
      title: s.form[s.localizeField(LocalizedFormProperties.TITLE)] ?? "",
      elements: s.form.elements,
      introduction: s.form.introduction,
      endPage: s.form.endPage,
      privacyPolicy: s.form.privacyPolicy,
      localizeField: s.localizeField,
      updateField: s.updateField,
    }));

  const [value, setValue] = useState<string>(title);

  const _debounced = useCallback(
    debounce((val: string | boolean) => {
      updateField(`form.${localizeField(LocalizedFormProperties.TITLE)}`, val);
    }, 100),
    []
  );

  useEffect(() => {
    setValue(title);
  }, [title]);

  const updateValue = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setValue(e.target.value);
      _debounced(e.target.value);
    },
    [setValue]
  );

  const introTextPlaceholder =
    introduction?.[localizeField(LocalizedElementProperties.DESCRIPTION)] ?? "";

  const confirmTextPlaceholder =
    endPage?.[localizeField(LocalizedElementProperties.DESCRIPTION)] ?? "";

  const policyTextPlaceholder =
    privacyPolicy?.[localizeField(LocalizedElementProperties.DESCRIPTION)] ?? "";

  return (
    <>
      <h1 className="visually-hidden">{t("edit")}</h1>
      <RichTextLocked
        beforeContent={
          <>
            <label htmlFor="formTitle" className="visually-hidden">
              {t("formTitle")}
            </label>
            <Input
              id="formTitle"
              placeholder={t("placeHolderFormTitle")}
              value={value}
              onChange={updateValue}
              className="w-3/4 mb-4 !text-h2 !font-sans !pb-0.5 !pt-1.5"
              theme="title"
            />
            <p className="text-sm mb-4">{t("startFormIntro")}</p>
          </>
        }
        addElement={true}
        initialValue={introTextPlaceholder}
        schemaProperty="introduction"
        ariaLabel={t("richTextIntroTitle")}
      />
      {elements.map((element, index: number) => {
        const item = { ...element, index };
        return <ElementWrapper item={item} key={item.id} />;
      })}
      {elements?.length >= 1 && (
        <>
          <RichTextLocked
            addElement={false}
            initialValue={policyTextPlaceholder}
            schemaProperty="privacyPolicy"
            ariaLabel={t("richTextPrivacyTitle")}
          >
            <div>
              <h2 className="text-h3 pb-3">{t("richTextPrivacyTitle")}</h2>
              <PrivacyDescription />
            </div>
          </RichTextLocked>
          <RichTextLocked
            addElement={false}
            initialValue={confirmTextPlaceholder}
            schemaProperty="endPage"
            ariaLabel={t("richTextConfirmationTitle")}
          >
            <div>
              <h2 className="text-h3 pb-3">{t("richTextConfirmationTitle")}</h2>
              <ConfirmationDescription />
            </div>
          </RichTextLocked>
        </>
      )}
    </>
  );
};

ElementPanel.propTypes = {
  item: PropTypes.object,
  onClose: PropTypes.func,
};
