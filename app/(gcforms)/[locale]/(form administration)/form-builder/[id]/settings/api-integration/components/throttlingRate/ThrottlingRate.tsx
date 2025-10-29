"use client";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "@i18n/client";
import { Alert, Button } from "@clientComponents/globals";
import {
  getCurrentThrottlingRate,
  temporarilyIncreaseThrottlingRate,
  permanentlyIncreaseThrottlingRate,
  resetThrottlingRate,
} from "./actions";
import { Checkbox } from "@formBuilder/components/shared/MultipleChoice";
import { Input } from "@formBuilder/components/shared/Input";
import { toast, ToastContainer } from "@formBuilder/components/shared/Toast";
import { getSecondsInWeeks, getWeeksInSeconds } from "@lib/utils/date/dateConversions";
import { SubmitButton } from "@clientComponents/globals/Buttons/SubmitButton";
import { Tooltip } from "@formBuilder/components/shared/Tooltip";
import { useRehydrate } from "@lib/store/hooks/useRehydrate";
import Skeleton from "react-loading-skeleton";
import { formClosingDateEst } from "@lib/utils/date/utcToEst";
import { logMessage } from "@lib/logger";
import { SettingsApplicationsIcon } from "@serverComponents/icons";

const THROTTLE_EXPIRY = {
  weeks: "weeks",
  permanent: "permanent",
  default: "default",
} as const;
type ObjectValues<T> = T[keyof T];
export type ThrottleExpiry = ObjectValues<typeof THROTTLE_EXPIRY>;

export const ThrottlingRate = ({ formId }: { formId: string }) => {
  const {
    t,
    i18n: { language },
  } = useTranslation("admin-settings");
  const hasHydrated = useRehydrate();
  const [loadedSetting, setLoadedSetting] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [weeks, setWeeks] = useState("");
  const lastValueForWeeks = useRef("");
  const [weeksDisabled, setWeeksDisabled] = useState(false);
  const [permanent, setPermanent] = useState(false);

  const [success, setSuccess] = useState<ThrottleExpiry | "">("");

  const dateFormat: Intl.DateTimeFormatOptions = {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  };

  const formatDate = (weeks: number, language: string) => {
    try {
      const weeksInSeconds = getWeeksInSeconds(weeks);
      const futureTimeInSeconds = Date.now() + weeksInSeconds;
      const dateInUTC = new Date(futureTimeInSeconds).toUTCString();
      const { month, day, year } = formClosingDateEst(dateInUTC, language, dateFormat);

      if (day && month && year) {
        return `${year}-${month}-${day}`;
      }

      throw new Error("Failed to parse out day, month or year.");
    } catch (error) {
      logMessage.info(`Unable to parse throttling in weeks: ${weeks}`);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (permanent) {
        const response = await permanentlyIncreaseThrottlingRate(formId);

        if (response !== undefined) {
          throw new Error("Failed to permanently increase throttling rate");
        }

        setSuccess(THROTTLE_EXPIRY.permanent);
        return;
      }

      if (weeks) {
        const response = await temporarilyIncreaseThrottlingRate(formId, Number(weeks));

        if (response !== undefined) {
          throw new Error("Failed to temporarily increase throttling rate");
        }

        setSuccess(THROTTLE_EXPIRY.weeks);
        return;
      }

      // Reset throttling back to default
      const response = await resetThrottlingRate(formId);

      if (response !== undefined) {
        throw new Error("Failed to reset throttling rate");
      }

      setSuccess(THROTTLE_EXPIRY.default);
    } catch (error) {
      toast.error(t("throttling.error"));
    } finally {
      setSubmitting(false);
    }
  };

  const throttlingErrorString = t("throttling.error");
  useEffect(() => {
    const getThrottlingSetting = async () => {
      try {
        const response = await getCurrentThrottlingRate(formId);

        if ("error" in response) {
          throw new Error("Failed to get current throttling rate");
        }

        const { rate, expires } = response;

        if (rate && expires < 0) {
          setWeeksDisabled(true);
          setPermanent(true);
        }
        if (rate && expires > 0) {
          const secondsAsWeeks = String(getSecondsInWeeks(expires - Date.now()));
          setWeeks(secondsAsWeeks);
          lastValueForWeeks.current = secondsAsWeeks;
        }
      } catch (error) {
        toast.error(throttlingErrorString);
      } finally {
        setLoadedSetting(true);
      }
    };
    setLoadedSetting(false);
    getThrottlingSetting();
  }, [formId, throttlingErrorString]);

  return (
    <div className="mb-10">
      <form onSubmit={handleSubmit}>
        <h2>
          <SettingsApplicationsIcon className="-mt-10px mr-1 inline-block" />{" "}
          {t("throttling.title")}
        </h2>
        <div role="alert">
          {success &&
            (success === THROTTLE_EXPIRY.weeks || success === THROTTLE_EXPIRY.permanent) && (
              <Alert.Success
                focussable={true}
                title={t("throttling.succcessUpdate.title")}
                className="mb-2"
              >
                <p>
                  {t("throttling.succcessUpdate.description", {
                    success:
                      success === THROTTLE_EXPIRY.weeks
                        ? formatDate(Number(weeks), language)
                        : success,
                  })}
                </p>
              </Alert.Success>
            )}
          {success && success === THROTTLE_EXPIRY.default && (
            <Alert.Success
              focussable={true}
              title={t("throttling.succcessReset.title")}
              className="mb-2"
            />
          )}
        </div>
        <fieldset>
          <legend>
            <strong>{t("throttling.description")}</strong>
          </legend>
          <div className="mb-2">
            {hasHydrated && loadedSetting ? (
              <>
                <Input
                  className="w-16 disabled:!border-none disabled:bg-gray-light"
                  id="throttling-weeks"
                  name="throttling-weeks"
                  value={weeks}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const value = e.target.value;
                    setWeeks(value);
                    lastValueForWeeks.current = value;
                  }}
                  {...{ disabled: weeksDisabled }}
                  type="number"
                  min="1"
                  max="12"
                />
                <label className="ml-4" htmlFor="throttling-weeks">
                  {t("throttling.weeks")}
                </label>
              </>
            ) : (
              <Skeleton className="w-16" count={2} />
            )}
          </div>
        </fieldset>
        <div className="mb-4 flex">
          <Checkbox
            data-testid="required"
            id="throttling-permanent"
            name="throttling-permanent"
            checked={permanent}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const checked = e.target.checked;
              setWeeks(checked ? "" : lastValueForWeeks.current);
              setWeeksDisabled(checked ? true : false);
              setPermanent(checked);
            }}
            label={t("throttling.permanent")}
          />
          <Tooltip.Info side="top" triggerClassName="mb-4" label={t("help")}>
            {t("throttling.tooltip")}
          </Tooltip.Info>
        </div>
        <div className="flex">
          <SubmitButton dataTestId="increase-throttle" theme="secondary" loading={submitting}>
            {t("throttling.updateRate")}
          </SubmitButton>
          <Button
            className="ml-4"
            dataTestId="reset-throttle"
            theme="link"
            type="submit"
            onClick={() => {
              setWeeks("");
              setPermanent(false);
              setWeeksDisabled(false);
            }}
          >
            {t("throttling.resetRate")}
          </Button>
        </div>
      </form>

      <div className="sticky top-0">
        <ToastContainer autoClose={false} containerId="throttling" />
      </div>
    </div>
  );
};
