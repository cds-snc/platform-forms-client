import { redirect } from "next/navigation";
import { ZodError, z } from "zod";

// Simple Data Structure. This could be a lot more detailed/complex
export const initialState = {
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

function handleErrorCode(code: string) {
  // TODO: use code to lookup translation key? or similar
  return code;
}

export async function doSomething(formData: FormData) {
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

    // Success.
    redirect("/en/test/success"); // Or could return success/* and do a router.rewrite() in the client
  } catch (e) {
    // Fail
    const { issues } = e as ZodError;
    const errors = issues.reduce((accumulator, issue) => {
      const fieldName = issue.path[0];
      const code = issue.code;
      const error = { [`_${fieldName}`]: `${handleErrorCode(code)}` };
      return { ...accumulator, ...error };
    }, {});

    return {
      ...data,
      ...errors,
    };
  }
}
