"use client";
import { useFormStatus } from "react-dom";
import { Button } from "@clientComponents/globals";

/* 
    To help visually and semantically show show a disabled button but not descrease accessibility,
    I added a new:
    -theme for "disabled" to work with aria-disabled. best not to disable a submit button fot a11y 
    -onKeyDown to button to prevent form submission on enter key press (and click)
*/
export const SubmitButton = () => {
  // Note: useFormStatus() will only work in a component outside of the form. (because React said so..)
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      theme={`${pending ? "disabled" : "primary"}`}
      className={`mr-4`}
      {...(pending && { "aria-disabled": true })}
      onClick={(e) => {
        if (pending) {
          e.preventDefault();
        }
      }}
      onKeyDown={(e) => {
        if (pending && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
        }
      }}
    >
      <span aria-live="polite">{!pending ? "Submit" : "Submit (loading...)"}</span>
    </Button>
  );
};
