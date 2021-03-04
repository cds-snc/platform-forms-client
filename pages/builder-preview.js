import React from "react";
import { useRouter } from "next/router";

const getFormData = async (e, router) => {
  e.preventDefault();

  const formConfig =
    e && e.target.elements && e.target.elements.jsonInput ? e.target.elements.jsonInput : {};
  if (!formConfig) return;

  router.push({
    pathname: "/preview-form",
    query: { formObject: JSON.stringify(JSON.parse(formConfig.value)) },
  });
};

const PreviewForm = () => {
  const router = useRouter();
  return (
    <>
      <h1 className="gc-h1">Preview a Form from JSON config</h1>

      <div>
        <form onSubmit={(e) => getFormData(e, router)} method="POST">
          <textarea
            id="jsonInput"
            rows="70"
            cols="30"
            name="jsonIput"
            className="gc-textarea"
          ></textarea>
          <div>
            <button type="submit" className="gc-button">
              Preview
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default PreviewForm;
