"use client";
import { useActionState } from "react";
import { findSubject } from "../actions";
import { Button } from "@clientComponents/globals";
import { EventList } from "./EventList";
import { useTranslation } from "@i18n/client";

const initialState = {
  message: "",
  userId: "",
  formId: "",
  subject: "",
};

export const Search = () => {
  const [state, formAction, pending] = useActionState(findSubject, initialState);
  const { t } = useTranslation("admin-events");

  return (
    <>
      <form action={formAction}>
        <div>
          <label className="pr-6" htmlFor="subject">
            {t("email_or_id")}:
          </label>
          <input
            className=" w-80 border-1 border-gray-500"
            type="text"
            id="subject"
            name="subject"
            required
          />
        </div>
        {/* ... */}
        <p aria-live="polite">{state?.message}</p>
        <Button type="submit" theme="primary" loading={pending} className="mt-4">
          {t("search")}
        </Button>
      </form>

      <div className="pt-6">
        <EventList formId={state?.formId} userId={state?.userId} />
      </div>
    </>
  );
};
