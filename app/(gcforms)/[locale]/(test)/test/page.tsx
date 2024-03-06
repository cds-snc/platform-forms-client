import { TestForm } from "./components/client/TestForm";

/**
Why defining a bunch of new components?
Forms-Form components are coupled to Fomik state. 
E.g. Label relies on validation.* and TextInput relies on useField() and helpers.
So we'll need to either refactor the existing components to be more configurable. I created new
components for now.
*/

export default function Page() {
  return (
    <div className="m-20">
      <h1>Zod Test</h1>
      <TestForm />
    </div>
  );
}
