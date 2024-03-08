"use client";
import { useFormState } from "react-dom";
import { useRouter } from "next/navigation";
import { useTranslation } from "@i18n/client";
import { Button } from "@clientComponents/globals";
import { FormInputState, doSomethingElse, initialState } from "../../actions";
import { Label } from "./Label";
import { Error } from "./Error";
import { Input } from "./Input";
import { Field } from "./Field";
import { SubmitButton } from "./SubmitButton";

export const TestForm = () => {
  const router = useRouter();
  const {
    i18n: { language },
  } = useTranslation("form-builder");

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const handleSubmit = async (prevState: any, formData: FormData) => {
    // Simulate a delay to show the loading state
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const result = await doSomethingElse(formData);
    if (result._status === "success") {
      router.replace(`/${language}/test?success`);
    }
    return result;
  };

  function handleErrors(data: FormInputState) {
    const errorList = Object.keys(data)
      .filter((key) => key.includes("Error"))
      .map((key) => ({ key, value: data[key as keyof FormInputState] }))
      .filter((error) => error.value && String(error.value).length > 0);

    return (
      <>
        Error form did not validate. Please fix these errors:
        <ul>
          {errorList.map((error) => {
            return <li key={error.key}>{String(error.value)}</li>;
          })}
        </ul>
      </>
    );
  }

  // TODO: event firing but not sure how to reset the state.
  const handleReset = () => {
    return initialState;
  };

  const [state, formAction] = useFormState(handleSubmit, initialState);

  return (
    <form action={formAction} onReset={handleReset}>
      <div className="mb-10">Debugging: state={JSON.stringify(state)}</div>
      <output aria-live="polite" className="block text-red-500 mb-5">
        {state && state._status === "error" && handleErrors(state)}
      </output>
      <Field>
        <>
          <Label fieldName="name" hasError={!!state._nameError}>
            Name (required)
          </Label>
          <Error fieldName="name">{state?._nameError && state._nameError}</Error>
          <Input name="name" hasError={Boolean(state._nameError)} />
        </>
      </Field>
      <Field>
        <>
          <Label fieldName="email" hasError={!!state._emailError}>
            Email (required)
          </Label>
          <Error fieldName="email">{state?._emailError && state._emailError}</Error>
          <Input name="email" hasError={Boolean(state._emailError)} />
        </>
      </Field>
      <fieldset>
        <legend className="sr-only">Address</legend>
        <Field>
          <>
            <Label fieldName="city" hasError={!!state._cityError}>
              City
            </Label>
            <Error fieldName="city">{state?._cityError && state._cityError}</Error>
            <Input name="city" hasError={Boolean(state._cityError)} />
          </>
        </Field>
        <Field>
          <>
            <Label fieldName="province" hasError={!!state._provinceError}>
              Province
            </Label>
            <Error fieldName="province">{state?._provinceError && state._provinceError}</Error>
            <Input name="province" hasError={Boolean(state._provinceError)} />
          </>
        </Field>
      </fieldset>
      <SubmitButton />
      <Button type="reset" theme="secondary">
        Reset
      </Button>
    </form>
  );
};
