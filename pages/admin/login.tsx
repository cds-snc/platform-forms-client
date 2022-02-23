import { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { isAdmin } from "@lib/auth";
import Login from "../../components/containers/Auth/Login";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await isAdmin(context);

  if (session) {
    // If user, redirect to admin
    return {
      props: {},
      redirect: {
        destination: `/${context.locale}/admin/`,
        permanent: false,
      },
    };
  }

  if (context.locale) {
    return {
      props: { ...(await serverSideTranslations(context.locale, ["common", "admin-login"])) },
    };
  }

  return { props: {} };
};

export default Login;
