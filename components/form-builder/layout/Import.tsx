import React, { useState } from "react";
import styled from "styled-components";
import useTemplateStore from "../store/useTemplateStore";
import { sortByLayout } from "../util";
import { validateTemplate } from "../validate";

const Separator = styled.div`
  border-top: 1px solid rgba(0, 0, 0, 0.12);
  margin: 20px 0;
`;

const UploadWrapper = styled.div`
  display: inline-block;
`;

export const Import = () => {
  const { importTemplate } = useTemplateStore();
  const [errors, setErrors] = useState("");
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target || !e.target.files) {
      return;
    }
    try {
      const fileReader = new FileReader();
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (e) => {
        if (!e.target || !e.target.result || typeof e.target.result !== "string") return;

        const data = JSON.parse(e.target.result);

        if (!validateTemplate(data)) {
          setErrors("Template validation failed");
          return;
        }

        // ensure elements follow layout array order
        data.form.elements = sortByLayout(data.form);
        importTemplate(data);
      };
    } catch (e) {
      if (e instanceof Error) {
        setErrors(e.message);
      }
    }
  };

  return (
    <>
      <Separator />
      <h2 className="gc-h2">Import template file</h2>
      <UploadWrapper>
        <input type="file" id="file" onChange={handleChange} />
        {errors && <div className="pt-2 pb-2 mt-4 mb-4 text-lg text-red-700">{errors}</div>}
      </UploadWrapper>
    </>
  );
};
