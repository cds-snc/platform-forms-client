import { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { getSession } from "next-auth/client";
import Login from "@components/containers/Auth/Login";
import { getCsrfToken } from "next-auth/client";

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
      props: {
        ...(await serverSideTranslations(context.locale, ["common", "admin-login"])),
        csrfToken: await getCsrfToken(context),
      },
    };
  }

  return { props: { csrfToken: await getCsrfToken(context) } };
};

export default Login;
