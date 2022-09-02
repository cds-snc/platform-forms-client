import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { requireAuthentication } from "@lib/auth";
import { getTemplateByID } from "@lib/templates";
import { UserRole } from "@prisma/client";
import Settings from "@components/admin/TemplateDelete/Settings";

const redirect = (locale: string | undefined) => {
  return {
    redirect: {
      // We can redirect to a 'Form does not exist page' in the future
      destination: `/${locale}/404`,
      permanent: false,
    },
  };
};

export const getServerSideProps = requireAuthentication(async (context) => {
  const formID = context?.params?.form;

  // Needed for typechecking of a ParsedURLQuery type which can be a string or string[]
  if (!formID || Array.isArray(formID)) return redirect(context.locale);

  if (formID) {
    // get form info from db

    const template = await getTemplateByID(formID);

    if (template) {
      return {
        props: {
          form: template,
          ...(context.locale &&
            (await serverSideTranslations(context.locale, ["common", "admin-templates"]))),
        },
      };
    }
  }
  // if no form returned, 404
  return redirect(context.locale);
}, UserRole.ADMINISTRATOR);

export default Settings;
