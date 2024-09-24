import { Button } from "@clientComponents/globals";

export default async function Page() {
  return (
    <>
      <h3 className="mb-4">Button component preview</h3>
      <div className="flex space-x-4">
        <Button theme="primary">Submit</Button>
        <Button theme="secondary">Cancel</Button>
        <Button theme="destructive">Delete</Button>
        <Button theme="disabled">Disabled</Button>
      </div>
    </>
  );
}
