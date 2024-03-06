import { TestForm } from "./TestForm";

/**
Notes
-Label has state variable from Formik, validation.*. Probably create a new Label
-TextInput has state vars from Formik, useField(), helpers.. Probably create new input
*/

export default function Page() {
  return (
    <div className="m-20">
      <h1>Zod Test</h1>
      <TestForm />
    </div>
  );
}
