"use client";
import { useFormState } from "react-dom";
import { Label } from "./Label";
import { Error } from "./Error";
import { Input } from "./Input";
import { Field } from "./Field";
import { Button } from "@clientComponents/globals";
import { doSomething, initialState } from "../../actions";

export const TestForm = () => {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const handleSubmit = async (prevState: any, formData: FormData) => {
    return doSomething(formData);
  };

  // TODO: not working..
  const handleReset = () => {
    return initialState;
  };

  const [state, formAction] = useFormState(handleSubmit, initialState);

  return (
    <form action={formAction} onReset={handleReset}>
      <div className="mb-10">Debugging: state={JSON.stringify(state)}</div>
      <Field>
        <>
          <Label fieldName="name" hasError={!!state._name}>
            Name (required)
          </Label>
          <Error fieldName="name">{state?._name && state._name}</Error>
          <Input name="name" hasError={Boolean(state._name)} />
        </>
      </Field>
      <Field>
        <>
          <Label fieldName="email" hasError={!!state._email}>
            Email (required)
          </Label>
          <Error fieldName="email">{state?._email && state._email}</Error>
          <Input name="email" required hasError={Boolean(state._email)} />
        </>
      </Field>
      <fieldset>
        <legend className="sr-only">Address</legend>
        <Field>
          <>
            <Label fieldName="city" hasError={!!state._city}>
              City
            </Label>
            <Error fieldName="city">{state?._city && state._city}</Error>
            <Input name="city" hasError={Boolean(state._city)} />
          </>
        </Field>
        <Field>
          <>
            <Label fieldName="province" hasError={!!state._province}>
              Province
            </Label>
            <Error fieldName="province">{state?._province && state._province}</Error>
            <Input name="province" hasError={Boolean(state._province)} />
          </>
        </Field>
      </fieldset>
      <Button type="submit" theme="primary" className="mr-4">
        Submit
      </Button>
      <Button type="reset" theme="secondary">
        Reset
      </Button>
    </form>
  );
};
