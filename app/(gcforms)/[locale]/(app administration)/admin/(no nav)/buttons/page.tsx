import { Button } from "@clientComponents/globals";

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

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
