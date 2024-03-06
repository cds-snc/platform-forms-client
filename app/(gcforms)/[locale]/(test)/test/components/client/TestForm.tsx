"use client";
import { useFormState } from "react-dom";
import { ZodError, z } from "zod";
import { Label } from "./Label";
import { Error } from "./Error";
import { Input } from "./Input";
import { Field } from "./Field";
import { Button } from "@clientComponents/globals";

// Simple Data Structure. This could be a lot more detailed/complex
const initialState = {
  name: "",
  _name: "", // Hide errors in state using an underscore. There are probalby many ways to do this.
  email: "",
  _email: "",
  city: "",
  _city: "",
  province: "",
  _province: "",
};

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email().min(1),
  city: z.string().max(5), // optional but with a character limit of 5
  province: z.string().max(5), // optional but with a character limit of 5
});
//.required(); To make all fields required

export const TestForm = () => {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const handleSubmit = async (prevState: any, formData: FormData) => {
    // Another way: const data = Object.fromEntries(formData.entries());
    const data = {
      ...initialState, // build off of default to remove any past errors
      name: formData.get("name"),
      email: formData.get("email"),
      city: formData.get("city"),
      province: formData.get("province"),
    };

    try {
      // Result Object:
      // -pass == {succes: true}
      // -fail == {success: false, error: {issues: [{path: ["FIELD_NAME"], code: "CODE"}] }}
      schema.parse(data); // use schema.safeParse(data) to not have the error thrown

      // Note: Probably redirect/* here or in a server action to success element/page/..

      // Success.
      return initialState; // Or could return currently filled in data
    } catch (e) {
      // Fail
      const { issues } = e as ZodError;
      const errors = issues.reduce((accumulator, issue) => {
        const fieldName = issue.path[0];
        const code = issue.code;
        const error = { [`_${fieldName}`]: `${code}` }; // TODO: use code to lookup translation key? or similar
        return { ...accumulator, ...error };
      }, {});

      return {
        ...data,
        ...errors,
      };
    }
  };

  const [state, formAction] = useFormState(handleSubmit, initialState);

  return (
    <form action={formAction}>
      {/* <div className="mb-10">Debugging: state={JSON.stringify(state)}</div> */}
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
      <Button type="submit" className="gc-button--blue">
        Submit
      </Button>
    </form>
  );
};
