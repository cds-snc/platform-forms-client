import { logMessage } from "@lib/logger";
import { ZodError, z } from "zod";

// Simple Data Structure. This could be a lot more detailed/complex
export const initialState = {
  _status: "",
  name: "",
  _nameError: "", // Hide errors in state using an underscore. There are probalby many ways to do this.
  email: "",
  _emailError: "",
  city: "",
  _cityError: "",
  province: "",
  _provinceError: "",
};

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email().min(1),
  city: z.string().max(5), // optional but with a character limit of 5
  province: z.string().max(5), // optional but with a character limit of 5
});
//.required(); To make all fields required

function handleErrorCode(code: string) {
  // TODO: use code to lookup translation key? or similar
  return code;
}

// Issue with the zod-throw way is sharing formInput must be outside try-catch and this could generate an error
// but putting inside the try-catch would require re-getting the formInput from the formData
export async function doSomething(formData: FormData) {
  // Another way: const data = Object.fromEntries(formData.entries());
  const formInput = {
    name: formData.get("name"),
    email: formData.get("email"),
    city: formData.get("city"),
    province: formData.get("province"),
  };

  try {
    // Result Object:
    // -pass == {succes: true}
    // -fail == {success: false, error: {issues: [{path: ["FIELD_NAME"], code: "CODE"}] }}
    schema.parse(formInput); // use schema.safeParse(data) to not have the error thrown

    // Success. -- Or could redirect here instead of the client
    return {
      ...initialState, // build off of default to remove any past errors
      ...formInput,
      _status: "success",
    };
  } catch (e) {
    if (!(e instanceof ZodError)) {
      logMessage.error(e);
      throw e;
    }

    // Fail
    const { issues } = e as ZodError;
    const errors = issues.reduce((accumulator, issue) => {
      const fieldName = issue.path[0];
      const code = issue.code;
      const error = { [`_${fieldName}Error`]: `${handleErrorCode(code)}` };
      return { ...accumulator, ...error };
    }, {});

    return {
      ...initialState,
      ...formInput,
      ...errors,
      _status: "error",
    };
  }
}
