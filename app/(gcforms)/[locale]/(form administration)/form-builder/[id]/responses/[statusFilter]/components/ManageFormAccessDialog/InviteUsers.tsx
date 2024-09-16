type InviteUserProps = {
  emailList: string[];
  setMessage: (message: string) => void;
};

export const InviteUsers = ({ emailList, setMessage }: InviteUserProps) => {
  return (
    <>
      <section>
        <div className="flex-wrap flex gap-2">
          {emailList.map((email) => {
            return (
              <div
                key={email}
                className="bg-violet-50 border border-violet-700 flex items-center gap-1 px-3 rounded-md"
              >
                <div>{email}</div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-4">
        <label>Message</label>
        <textarea className="gc-textarea" onChange={(e) => setMessage(e.target.value)} />
      </section>
    </>
  );
};
