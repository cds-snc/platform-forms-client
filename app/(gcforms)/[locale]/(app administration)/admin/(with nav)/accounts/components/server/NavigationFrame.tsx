import { FilterButton } from "../client/FilterButton";
import { serverTranslation } from "@i18n";

export const NavigtationFrame = async ({
  userState,
  children,
}: React.PropsWithChildren<{ userState?: string }>) => {
  // useEffect(() => {
  //   if (previousUserRef) {
  //     // if there is a user id in the query param, scroll to that user card
  //     const element = document.getElementById(`user-${previousUserRef}`);
  //     element?.scrollIntoView({ behavior: "smooth" });
  //   }
  // }, [previousUserRef]);

  const {
    t,
    i18n: { language },
  } = await serverTranslation("admin-users");

  return (
    <>
      <div className="mb-5">
        <ul
          id="accountsFilterList"
          className="flex list-none px-0 text-base"
          aria-label={t("accountsFilterLabel")}
        >
          <li className="mr-2 py-2 pt-3 text-sm tablet:mr-4">
            <FilterButton active={!userState ? true : false} url={`/${language}/admin/accounts`}>
              {t("accountsFilter.all")}
            </FilterButton>
          </li>
          <li className="mr-2 py-2 pt-3 text-sm tablet:mr-4">
            <FilterButton
              active={userState === "active" ? true : false}
              url={`/${language}/admin/accounts?userState=active`}
            >
              {t("accountsFilter.active")}
            </FilterButton>
          </li>
          <li className="mr-2 py-2 pt-3 text-sm tablet:mr-4">
            <FilterButton
              active={userState === "deactivated" ? true : false}
              url={`/${language}/admin/accounts?userState=deactivated`}
            >
              {t("accountsFilter.deactivated")}
            </FilterButton>
          </li>
        </ul>
      </div>
      {children}
    </>
  );
};
