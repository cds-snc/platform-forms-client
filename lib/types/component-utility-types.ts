export interface InputFieldProps {
  id?: string;
  className?: string;
  name: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  ariaDescribedBy?: string;
  lang?: string;
}

export interface ChoiceFieldProps extends InputFieldProps {
  label: string;
}
