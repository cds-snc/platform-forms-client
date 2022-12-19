import React from "react";

export const TextArea = ({
  id,
  name,
  describedBy,
  value,
  onChange,
  onKeyDown,
  className,
  placeholder,
  lang,
}: {
  id: string;
  name?: string;
  placeholder?: string;
  describedBy?: string;
  value?: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  className?: string;
  lang?: string;
}) => {
  return (
    <textarea
      id={id}
      name={name}
      aria-describedby={describedBy}
      className={`${className} py-2 px-3 my-2 rounded border-1.5 border-black-default border-solid focus:outline-2 focus:outline-blue-focus focus:outline focus:border-blue-focus`}
      value={value}
      placeholder={placeholder}
      onChange={onChange}
      onKeyDown={onKeyDown}
      {...(lang && { lang: lang })}
    >
      {value}
    </textarea>
  );
};
