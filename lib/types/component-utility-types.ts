export interface InputFieldProps {
  id?: string;
  className?: string;
  name: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  ariaDescribedBy?: string;
}

export interface ChoiceFieldProps extends InputFieldProps {
  label: string;
}

export type CharacterCountMessages = {
  part1: string;
  part2: string;
  part1Error: string;
  part2Error: string;
};
