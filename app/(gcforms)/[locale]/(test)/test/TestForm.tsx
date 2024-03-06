"use client";
import { Button } from "@clientComponents/globals";
import { useFormState } from "react-dom";
import { ZodError, z } from "zod";

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

export const TestForm = () => {
  const schema = z.object({
    name: z.string().min(1),
    email: z.string().email().min(1),
    city: z.string().max(5), // optional but with a character limit of 5
    province: z.string().max(5), // optional but with a character limit of 5
  });
  //.required(); To make all fields required

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

      // Note: Probably redirect/* to success at this point or in server action

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
      <div className="mb-10">state={JSON.stringify(state)}</div>
      <div className="focus-group flex flex-col">
        <label id={"label-name"} htmlFor={"name"} className={`${state?._name && "text-red-500"}`}>
          Name (required)
        </label>
        <p aria-live="polite" className="text-red-500">
          {state?._name && state._name}
        </p>
        <input type={"text"} id={"name"} name={"name"} className="border-2 border-black-default" />
      </div>
      <div className="focus-group flex flex-col">
        <label
          id={"label-email"}
          htmlFor={"email"}
          className={`${state?._email && "text-red-500"}`}
        >
          Email (required)
        </label>
        <p aria-live="polite" className="text-red-500">
          {state?._email && state._email}
        </p>
        <input
          type={"text"}
          id={"email"}
          name={"email"}
          className="border-2 border-black-default"
          required
        />
      </div>
      <fieldset>
        <legend className="sr-only">Address</legend>
        <div className="focus-group flex flex-col">
          <label id={"label-city"} htmlFor={"city"} className={`${state?._city && "text-red-500"}`}>
            City
          </label>
          <p aria-live="polite" className="text-red-500">
            {state?._city && state._city}
          </p>
          <input
            type={"text"}
            id={"city"}
            name={"city"}
            className="border-2 border-black-default"
          />
        </div>
        <div className="focus-group flex flex-col">
          <label
            id={"label-province"}
            htmlFor={"province"}
            className={`${state?._province && "text-red-500"}`}
          >
            Province
          </label>
          <p aria-live="polite" className="text-red-500">
            {state?._province && state._province}
          </p>
          <input
            type={"text"}
            id={"province"}
            name={"province"}
            className="border-2 border-black-default"
          />
        </div>
      </fieldset>
      <Button type="submit" className="gc-button--blue">
        Submit
      </Button>
    </form>
  );
};
