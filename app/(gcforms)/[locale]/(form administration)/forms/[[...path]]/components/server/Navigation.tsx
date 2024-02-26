import { serverTranslation } from "@i18n";
import { SubNavLink } from "@clientComponents/form-builder/app/navigation/SubNavLink";
import { FolderIcon, GlobeIcon, PageIcon } from "@serverComponents/icons";

export const Navigation = async (/*{filter }: {filter?: string}*/) => {
  const {
    t,
    i18n: { language },
  } = await serverTranslation(["my-forms", "form-builder"]);

  const iconClassname =
    "inline-block w-6 h-6 group-hover:fill-blue-hover group-focus:fill-white-default group-active:fill-white-default mr-2 -mt-1";

  // TODO refactor/recreate SubNavLink to use the filter query and be a server component?
  return (
    <nav className="flex flex-wrap laptop:mb-4" aria-label={t("navLabel")}>
      <SubNavLink href={`/${language}/forms`} setAriaCurrent={true} id="tab-all">
        <>
          <FolderIcon className={iconClassname} />
          {t("nav.all")}
        </>
      </SubNavLink>

      <SubNavLink
        href={`/${language}/forms?formsState=drafts`}
        setAriaCurrent={true}
        id="tab-drafts"
      >
        <>
          <PageIcon className={iconClassname} />
          {t("nav.drafts")}
        </>
      </SubNavLink>

      <SubNavLink
        href={`/${language}/forms?formsState=published`}
        setAriaCurrent={true}
        id="tab-published"
      >
        <>
          <GlobeIcon className={iconClassname} />
          {t("nav.published")}
        </>
      </SubNavLink>
    </nav>
  );
};
