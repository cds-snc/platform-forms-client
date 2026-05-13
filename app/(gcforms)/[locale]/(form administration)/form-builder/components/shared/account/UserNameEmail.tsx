export const UserNameEmail = ({ name, email }: { name: string; email: string }) => {
  return (
    <div>
      <h2 className="mb-0 pb-1 text-base">{name}</h2>
      <p className="mb-4">{email}</p>
    </div>
  );
};
