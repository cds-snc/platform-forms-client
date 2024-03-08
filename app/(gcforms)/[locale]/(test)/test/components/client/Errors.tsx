import { useTranslation } from "@i18n/client";
import { FormInputState } from "./TestForm";

export const Errors = ({ state }: { state: FormInputState }) => {
  const { t } = useTranslation("form-builder");

  function handleErrors(data: FormInputState) {
    const errorList = Object.keys(data)
      .filter((key) => key.includes("Error"))
      .map((key) => ({ key, value: data[key as keyof FormInputState] }))
      .filter((error) => error.value && String(error.value).length > 0);

    function removeError(key: string) {
      // TODO improve regex
      return key.replace(/Error/, "").replace(/_/, "");
    }

    return (
      <>
        Error form did not validate. Please fix these errors:
        <ul>
          {errorList.map((error) => {
            return (
              <li key={error.key}>
                {removeError(error.key)}: {t(`validation.${String(error.value)}`)}
              </li>
            );
          })}
        </ul>
      </>
    );
  }

  return (
    <output aria-live="polite" className="block text-red-500 mb-5">
      {state && state._status === "error" && handleErrors(state)}
    </output>
  );
};
