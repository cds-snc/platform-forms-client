"use client";

import { useTranslation } from "@i18n/client";
import { useActionState, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { acceptPolicy } from "../../actions";
import { SubmitButton } from "@clientComponents/globals/Buttons/SubmitButton";

export const AcceptButton = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation("common");

  const { update: sessionUpdate } = useSession();
  const [, formAction, isPending] = useActionState(acceptPolicy, {});
  const [isUpdatingSession, setIsUpdatingSession] = useState(false);
  const sessionUpdatedRef = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Update session when form is submitted (before server action executes)
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    // If session has already been updated, let the form submit naturally
    if (sessionUpdatedRef.current) {
      return;
    }

    event.preventDefault();

    setIsUpdatingSession(true);

    // Update the session to mark acceptableUse as true
    await sessionUpdate({
      user: { acceptableUse: true },
    });

    sessionUpdatedRef.current = true;
    setIsUpdatingSession(false);

    // Now submit the form to trigger the server action
    if (formRef.current) {
      formRef.current.requestSubmit();
    }
  };

  return (
    <form ref={formRef} action={formAction} onSubmit={handleSubmit}>
      <input type="hidden" name="language" value={language} />
      <SubmitButton id="acceptableUse" type="submit" loading={isPending || isUpdatingSession}>
        {t("acceptableUsePage.agree")}
      </SubmitButton>
    </form>
  );
};
