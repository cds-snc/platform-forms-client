import { ErrorMessage } from "@clientComponents/forms";
import { ChoiceFieldProps, InputFieldProps } from "@lib/types";
import { Checkbox } from "./Checkbox";
import { Radio } from "./Radio";

interface MultipleChoiceGroupProps extends InputFieldProps {
  choicesProps: Array<ChoiceFieldProps>;
  type: "checkbox" | "radio";
  error: string;
}

// Note: Id is generated
export const MultipleChoiceGroup = ({
  name,
  className,
  choicesProps,
  type,
  ariaDescribedBy,
  error,
}: MultipleChoiceGroupProps): React.ReactElement => {
  const choices = choicesProps.map((choice, index) => {
    return type == "checkbox" ? (
      <Checkbox
        {...choice}
        key={index}
        name={name}
        className={className}
        ariaDescribedBy={ariaDescribedBy}
      />
    ) : (
      <Radio
        {...choice}
        key={index}
        name={name}
        className={className}
        ariaDescribedBy={ariaDescribedBy}
      />
    );
  });
  return (
    <>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {choices}
    </>
  );
};
