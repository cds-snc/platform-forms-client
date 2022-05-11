import { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { getSession } from "next-auth/react";
import Login from "@components/containers/Auth/Login";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  if (session?.user.admin)
    return {
      props: {},
      redirect: {
        destination: `/${context.locale}/admin/`,
        permanent: false,
      },
    };

  if (session)
    return {
      props: {},
      redirect: {
        destination: `/${context.locale}/admin/unauthorized/`,
        permanent: false,
      },
    };

  if (context.locale) {
    return {
      props: { ...(await serverSideTranslations(context.locale, ["common", "admin-login"])) },
    };
  }

  return { props: {} };
};

export default Login;
