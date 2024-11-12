import { Button } from "@clientComponents/globals";
import { useTranslation } from "@i18n/client";

// TODO
export const ThrottlingRate = () => {
  const { t } = useTranslation();
  const updateThrottling = (e: React.FormEvent) => {
    e.preventDefault();
    // console.log("updateThrottling")
  };

  // TODO: Probably drop GCDS for custom control
  return (
    <div className="mb-20">
      <form onSubmit={updateThrottling}>
        <h2>{t("TODO-Throttling Rate")}</h2>
        <p>
          <strong>{t("TODO-Increase throttling rate for up to 12 weeks")}</strong>
        </p>
        <div className="focus-group gcds-input-wrapper flex mb-0">
          {/* wrapped - hard to overwrite gcds width.. */}
          <div className="w-16">
            <input
              className="mb-2 gc-input-text mr-2"
              name="throttling-weeks"
              id="throttling-weeks"
              required
              maxLength={2}
              pattern="\d{1,2}"
            />
          </div>
          <label className="gc-label required mt-2 ml-2" htmlFor="throttling-weeks">
            {t("TODO-Weeks")}
          </label>
        </div>
        {/*
          TODO: success message
          Throttling rate increased.
          Rate will stay in effect until YYYY-MM-DD) 
        */}
        <div className="focus-group gc-input-checkbox mb-8">
          <input
            className="gc-input-checkbox__input"
            type="checkbox"
            name="throttling-permanent"
            id="throttling-permanent"
          />
          <label className="checkbox-label-text mt-2 ml-12" htmlFor="throttling-permanent">
            {t("TODO-Permanently increase throttling rate")}
          </label>
        </div>
        <Button dataTestId="increase-throttle" theme="secondary" type="submit">
          {t("TODO-Update rate")}
        </Button>
      </form>
    </div>
  );
};
