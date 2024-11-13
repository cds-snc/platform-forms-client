"use client";
import { useState } from "react";
import { useTranslation } from "@i18n/client";
import { Button } from "@clientComponents/globals";
import {
  permanentThrottling,
  resetThrottling,
  scheduledThrottling,
} from "@lib/cache/throttlingCache";
import { Checkbox } from "@formBuilder/components/shared/MultipleChoice";
import { Input } from "@formBuilder/components/shared/Input";
import { logMessage } from "@lib/logger";

// TODO only show this if the user has access

export const ThrottlingRate = ({ formId }: { formId: string }) => {
  const { t } = useTranslation();
  const [weeks, setWeeks] = useState("");
  const [permanent, setPermanent] = useState("");
  const [success, setSuccess] = useState("");

  const formAction = async (/*formData*/) => {
    logMessage.info(`Client updateThrottling ${formId}, ${weeks}, ${permanent}`);

    if (permanent) {
      await permanentThrottling(formId);
      setSuccess("permanent");
      return;
    }

    if (weeks) {
      await scheduledThrottling(formId, Number(weeks));
      // TODO convert weeks to YYYY-MM-DD
      setSuccess("weeks");
      return;
    }

    // Reset - either blank form or reset clicked
    await resetThrottling(formId);
    setSuccess("reset");
  };

  return (
    <div className="mb-20">
      <form action={formAction}>
        <h2>{t("TODO-Throttling Rate")}</h2>
        <p>
          <strong>{t("TODO-Increase throttling rate for up to 12 weeks")}</strong>
        </p>
        <div>
          <Input
            className="w-16"
            id="throttling-weeks"
            name="throttling-weeks"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWeeks(e.target.value)}
          />
          <label className="mt-2 ml-2" htmlFor="throttling-weeks">
            {t("TODO-Weeks")}
          </label>
        </div>
        <div role="alert">
          {success && (success === "weeks" || success === "permanent") && (
            <div>
              Throttling rate increased.
              <br />
              Rate will stay in effect until: {success}
            </div>
          )}
          {success && success === "reset" && <div>Throttling rate reset.</div>}
        </div>
        <div className="focus-group mb-4 flex align-middle">
          <Checkbox
            data-testid="required"
            id="throttling-permanent"
            name="throttling-permanent"
            value={permanent}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPermanent(e.target.checked)}
          ></Checkbox>
          <label className="" htmlFor="throttling-permanent">
            {t("TODO-Permanently increase throttling rate")}
          </label>
        </div>
        <div className="flex">
          <Button dataTestId="increase-throttle" theme="secondary" type="submit">
            {t("TODO-Update rate")}
          </Button>
          <Button className="ml-4" dataTestId="reset-throttle" theme="link" type="submit">
            {t("TODO-Reset throttle")}
          </Button>
        </div>
      </form>
    </div>
  );
};
