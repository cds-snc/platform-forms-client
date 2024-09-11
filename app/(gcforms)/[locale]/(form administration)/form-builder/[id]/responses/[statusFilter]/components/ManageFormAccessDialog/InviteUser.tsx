type InviteUserProps = {
  selectedEmail: string;
  setMessage: (message: string) => void;
};

export const InviteUser = ({ selectedEmail, setMessage }: InviteUserProps) => {
  return (
    <>
      <section>
        <div className="inline-block rounded-md border-1 border-violet-700 bg-violet-50 px-3 py-1">
          {selectedEmail}
        </div>
      </section>

      <section className="mt-4">
        <label>Message</label>
        <textarea className="gc-textarea" onChange={(e) => setMessage(e.target.value)} />
      </section>
    </>
  );
};
