import { signIn } from "next-auth/react";
import { useSession } from "next-auth/react";

export const Login = ({ language = "en" }) => {
  const { data, status } = useSession();

  if (status === "loading") {
    return;
  }

  if (status === "authenticated") {
    return <div>{`Hello ${data.user?.name}`}</div>;
  }
  return (
    <form
      action={async () => {
        signIn("gcAccount", { redirectTo: `/${language}/auth/policy` });
      }}
    >
      <button
        className="border-gcds-blue-800 bg-gcds-blue-900 text-white-default hover:border-gcds-blue-800 hover:bg-gcds-blue-800 hover:text-white-default active:border-black"
        type="submit"
      >
        Sign in
      </button>
    </form>
  );
};
