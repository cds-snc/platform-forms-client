import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { requireAuthentication } from "@lib/auth";
import { getTemplateByID } from "@lib/templates";
import Settings from "@components/admin/TemplateDelete/Settings";
import { checkPrivileges } from "@lib/privileges";

const redirect = (locale: string | undefined) => {
  return {
    redirect: {
      // We can redirect to a 'Form does not exist page' in the future
      destination: `/${locale}/404`,
      permanent: false,
    },
  };
};

export const getServerSideProps = requireAuthentication(
  async ({ locale, params, user: { ability } }) => {
    // Only users who have the ManageForms privilege can view this page for now
    checkPrivileges(ability, [{ action: "update", subject: { type: "FormRecord", object: {} } }]);

    const formID = params?.form;
    // Needed for typechecking of a ParsedURLQuery type which can be a string or string[]
    if (!formID || Array.isArray(formID)) return redirect(locale);

    if (formID) {
      // get form info from db

      const template = await getTemplateByID(formID);

      if (template) {
        return {
          props: {
            form: template,
            ...(locale && (await serverSideTranslations(locale, ["common", "admin-templates"]))),
          },
        };
      }
    }
    // if no form returned, 404
    return redirect(locale);
  }
);

export default Settings;
