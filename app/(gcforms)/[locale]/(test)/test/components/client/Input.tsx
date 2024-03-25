export const Input = ({
  type = "text",
  name,
  id,
  required,
  hasError,
}: {
  type?: string;
  id?: string | undefined;
  required?: boolean;
  name: string;
  hasError: boolean;
}) => {
  return (
    <input
      type={type}
      id={id || name}
      name={name}
      className={`border-2 ${hasError ? "border-red-500" : "border-black-default"}`}
      {...(required && { required: true })}
    />
  );
};
