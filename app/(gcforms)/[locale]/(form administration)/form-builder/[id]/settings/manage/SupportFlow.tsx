import { Button } from "@clientComponents/globals";
import { logMessage } from "@lib/logger";

export const SupportFlow = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get("support-flow-email") as string;

    logMessage.info(`SupportFlow email set to - TODO send to DB: ${email}`);
  };

  return (
    <form className="mb-10" onSubmit={handleSubmit}>
      <h2>Support channels</h2>
      <p className="mb-4">Add contact information to your form in case there is an issue.</p>
      <div className="mb-4 inline-block rounded-sm border-1 border-solid  border-slate-500">
        <label htmlFor="support-flow-email" className="inline-block h-full bg-slate-100 px-4 py-2">
          email
        </label>
        <input
          id="support-flow-email"
          name="support-flow-email"
          className="w-96 border-l-1 border-solid  border-slate-500 p-2"
          type="email"
        />
      </div>
      <div>
        <Button theme="secondary" type="submit">
          Save changes
        </Button>
      </div>
    </form>
  );
};
