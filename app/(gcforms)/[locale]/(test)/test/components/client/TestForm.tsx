"use client";
import { useFormState } from "react-dom";
import { useRouter } from "next/navigation";
import { useTranslation } from "@i18n/client";
import { Button } from "@clientComponents/globals";
import { doSomethingBetter, initialState } from "../../actions";
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

    const result = await doSomethingBetter(formData);
    if (result._status === "success") {
      router.replace(`/${language}/test?success`);
    }
    return result;
  };

  // TODO: event firing but not sure how to reset the state.
  const handleReset = () => {
    return initialState;
  };

  const [state, formAction] = useFormState(handleSubmit, initialState);

  return (
    <form action={formAction} onReset={handleReset}>
      <div className="mb-5">Debugging: state={JSON.stringify(state)}</div>
      <output aria-live="polite" className="block text-red-500 mb-5">
        {state._status === "error" && "Error form did not validate."}
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
