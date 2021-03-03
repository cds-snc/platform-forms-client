import React from "react";
import classnames from "classnames";
import { useField } from "formik";

interface RadioProps {
  id: string;
  name: string;
  className?: string;
  label: string;
}

export const Radio = (props: RadioProps & JSX.IntrinsicElements["input"]): React.ReactElement => {
  const { id, className, label } = props;

  const classes = classnames("gc-input-radio", className);

  const [field, meta] = useField(props);

  return (
    <div data-testid="radio" className={classes}>
      {meta.touched && meta.error ? <div className="error">{meta.error}</div> : null}

      <input
        className="gc-radio__input"
        id={id}
        type="radio"
        {...field}
        value={label} // This needs to be static... the actual label...
      />
      <label className="gc-radio-label" htmlFor={id}>
        <span className="radio-label-text">{label}</span>
      </label>
    </div>
  );
};

export default Radio;
