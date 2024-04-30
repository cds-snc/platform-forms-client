"use client";
import { Button } from "@clientComponents/globals";
import { GroupOutput } from "@formBuilder/components/shared/GroupOutput";
import { useGCFormsContext } from "@lib/hooks/useGCFormContext";
import React from "react";

export const Review = ({ id }: { id: string | number }): React.ReactElement => {
  const {
    formRecord: { id: formId },
    groups,
    getValues,
    setGroup,
    currentGroup,
    previousGroup,
  } = useGCFormsContext();
  const formValues = getValues();

  return (
    <>
      <h2>Review TODO</h2>
      TEMP
      <pre>
        Form ID = {formId}
        <br />
        Element ID={id}
        <br />
        Groups = {JSON.stringify(groups)}
        <br />
        Values = {JSON.stringify(formValues)}
        <br />
        Current Group = {currentGroup}
        <br />
        Previous Group = {previousGroup}
      </pre>
      <Button
        onClick={() => {
          setGroup(previousGroup);
        }}
      >
        {" "}
        EDIT
      </Button>
      <GroupOutput />
    </>
  );
};
