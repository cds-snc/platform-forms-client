import React, { useEffect, useState } from "react";
import classnames from "classnames";
import { useField } from "formik";
import ErrorMessage from "../ErrorMessage/ErrorMessage";
import { CharacterCountMessages } from "@lib/types";

export interface TextAreaProps {
  id: string;
  name: string;
  characterCountMessages: CharacterCountMessages;
  className?: string;
  required?: boolean;
  children?: React.ReactNode;
  ariaDescribedBy?: string;
  placeholder?: string;
}

export const TextArea = (
  props: TextAreaProps & JSX.IntrinsicElements["textarea"]
): React.ReactElement => {
  const {
    id,
    className,
    ariaDescribedBy,
    required,
    children,
    placeholder,
    maxLength,
    characterCountMessages,
  } = props;

  const classes = classnames("gc-textarea", className);

  const [field, meta, helpers] = useField(props);

  const [remainingCharacters, setRemainingCharacters] = useState(0);

  useEffect(() => {
    if (maxLength) {
      setRemainingCharacters(maxLength);
    }
  }, []);

  const handleTextAreaChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    helpers.setValue(event.target.value);
    if (maxLength) {
      setRemainingCharacters(maxLength - event.target.value.length);
    }
  };

  return (
    <>
      {meta.error && <ErrorMessage>{meta.error}</ErrorMessage>}
      <textarea
        data-testid="textarea"
        className={classes}
        id={id}
        required={required}
        aria-describedby={ariaDescribedBy}
        placeholder={placeholder}
        {...field}
        onChange={handleTextAreaChange}
      >
        {children}
      </textarea>
      {maxLength && remainingCharacters < maxLength * 0.25 && remainingCharacters >= 0 && (
        <div id={"character-count-message" + id}>
          {characterCountMessages.part1} {remainingCharacters} {characterCountMessages.part2}
        </div>
      )}
      {maxLength && remainingCharacters < 0 && (
        <div id={"character-count-message" + id} className="gc-error-message">
          {characterCountMessages.part1Error} {remainingCharacters * -1}{" "}
          {characterCountMessages.part2Error}
        </div>
      )}
    </>
  );
};

export default TextArea;
