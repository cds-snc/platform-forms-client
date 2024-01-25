import React from "react";
import { InputFieldProps } from "@lib/types";
import classnames from "classnames";
import { useField } from "formik";
import { ErrorMessage } from "@components/forms";

interface ComboboxProps extends InputFieldProps {
  children?: React.ReactElement;
  choices?: string[];
}

interface ComboboxOptionProps {
  id: string;
  name: string;
  value: string;
}

const ComboboxOption = (props: ComboboxOptionProps): React.ReactElement => {
  return (
    <li
      role="option"
      data-value={props.value}
      aria-selected="false"
      id={props.id}
      className="cursor-pointer p-2 hover:bg-slate-300"
      onClick={(e) => {
        // setSelectedItem(e);
      }}
    >
      {props.name}
    </li>
  );
};

export const Combobox = (props: ComboboxProps): React.ReactElement => {
  const { children, id, name, className, choices = [], required, ariaDescribedBy } = props;
  const classes = classnames("gc-combobox", className);
  const [field, meta] = useField(props);
  const [query, setQuery] = React.useState("");
  const [selectedItem, setSelectedItem] = React.useState("");
  const [listOpen, setListOpen] = React.useState(false);

  const handleInputOnBlur = () => {
    //
  };

  const handleInputOnCick = (e) => {
    setListOpen(true);
  };

  const handleInputOnChange = (e) => {
    setListOpen(true);
    setQuery(e.target.value);
  };

  const filteredChoices =
    query === "" ? choices : choices.filter((choice) => choice.includes(query.toLowerCase()));

  const options = filteredChoices.map((choice, i) => {
    const innerId = `${id}.${i}`;
    return <ComboboxOption id={innerId} key={`key-${innerId}`} value={choice} name={choice} />;
  });

  return (
    <>
      {/* {meta.error && <ErrorMessage>{meta.error}</ErrorMessage>} */}
      <div className="gc-combobox relative">
        <input
          data-testid="combobox"
          autoComplete="off"
          className={classes}
          type="text"
          id={`${id}-combobox`}
          role="combobox"
          aria-controls={`${id}-listbox`}
          aria-autocomplete="list"
          aria-expanded="false"
          data-active-option="item1"
          aria-activedescendant=""
          {...(name && { name })}
          required={required}
          aria-describedby={ariaDescribedBy}
          {...field}
          onClick={(event) => handleInputOnCick(event)}
          onBlur={handleInputOnBlur}
          onChange={(event) => handleInputOnChange(event)}
          value={query}
        />
        {listOpen && (
          <ul
            id={`${id}-listbox`}
            role="listbox"
            aria-label=""
            data-testid="listbox"
            className="absolute top-16 z-10 ml-2 min-w-[250px] list-none rounded-md border border-slate-800 bg-white pl-0"
          >
            {children ? children : <>{options}</>}
          </ul>
        )}
      </div>
    </>
  );
};
