"use client";
import { useFormState } from "react-dom";
import { useRouter } from "next/navigation";
import { useTranslation } from "@i18n/client";
import { Button } from "@clientComponents/globals";
import { doSomethingElse } from "../../actions";
import { Label } from "./Label";
import { Error } from "./Error";
import { Input } from "./Input";
import { Field } from "./Field";
import { SubmitButton } from "./SubmitButton";
import { Errors } from "./Errors";

// Note: Had to put FormInputState and initialState here vs in actions because of the below error thrown when in actions.ts:
// "Error: A "use server" file can only export async functions, found object."

// Simple Data Structure. This could be a lot more detailed/complex
export type FormInputState = {
  _status: string;
  name: FormDataEntryValue | null;
  _nameError: string;
  email: FormDataEntryValue | null;
  _emailError: string;
  city: FormDataEntryValue | null;
  _cityError: string;
  province: FormDataEntryValue | null;
  _provinceError: string;
};

// Zod only validates what you tell it to so you can have extra fields E.g. hide errors in underscored names
export const initialState: FormInputState = {
  _status: "",
  name: "",
  _nameError: "",
  email: "",
  _emailError: "",
  city: "",
  _cityError: "",
  province: "",
  _provinceError: "",
};

export const TestForm = () => {
  const router = useRouter();
  const {
    t,
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

  function translateCode(code: string) {
    return t(`validation.${code}`);
  }

  // TODO: event firing but not sure how to reset the state.
  const handleReset = () => {
    return initialState;
  };

  const [state, formAction] = useFormState(handleSubmit, initialState);

  return (
    <form action={formAction} onReset={handleReset}>
      {/* <div className="mb-10">Debugging: state={JSON.stringify(state)}</div> */}
      <Errors state={state} />
      <Field>
        <>
          <Label fieldName="name" hasError={!!state._nameError}>
            Name (required)
          </Label>
          <Error fieldName="name">{state?._nameError && translateCode(state._nameError)}</Error>
          <Input name="name" hasError={Boolean(state._nameError)} />
        </>
      </Field>
      <Field>
        <>
          <Label fieldName="email" hasError={!!state._emailError}>
            Email (required)
          </Label>
          <Error fieldName="email">{state?._emailError && translateCode(state._emailError)}</Error>
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
            <Error fieldName="city">{state?._cityError && translateCode(state._cityError)}</Error>
            <Input name="city" hasError={Boolean(state._cityError)} />
          </>
        </Field>
        <Field>
          <>
            <Label fieldName="province" hasError={!!state._provinceError}>
              Province
            </Label>
            <Error fieldName="province">
              {state?._provinceError && translateCode(state._provinceError)}
            </Error>
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
