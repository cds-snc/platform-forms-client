import { Description } from "@clientComponents/forms";
import { ChoiceFieldProps } from "@lib/types";

export const Checkbox = ({
  id,
  label,
  required,
  name,
  ariaDescribedBy,
}: ChoiceFieldProps & JSX.IntrinsicElements["input"]): React.ReactElement => {
  return (
    <div className="gc-input-checkbox" data-testid={id}>
      {ariaDescribedBy && (
        <Description id={id} className="gc-form-group-context">
          {ariaDescribedBy}
        </Description>
      )}
      <input
        className="gc-input-checkbox__input"
        id={id}
        type="checkbox"
        value={label}
        required={required}
        name={name}
      />
      <label className="gc-checkbox-label" htmlFor={id}>
        <span className="checkbox-label-text">{label}</span>
      </label>
    </div>
  );
};
