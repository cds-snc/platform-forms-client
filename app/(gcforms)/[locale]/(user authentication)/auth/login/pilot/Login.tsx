"use client";
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
        signIn("gcForms", { redirectTo: `/${language}/auth/policy` });
      }}
    >
      <button
        className="rounded-xl border-3 border-gcds-gray-500 p-3 text-blue-900 hover:border-gcds-blue-800 hover:bg-gcds-blue-800 hover:text-white-default active:border-black"
        type="submit"
      >
        Sign in with Zitadel
      </button>
    </form>
  );
};
