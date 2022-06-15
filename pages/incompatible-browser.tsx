import React from "react";
import { PublicFormRecord } from "@lib/types";

const IncompatibleBrowser = ({
  formProps,
}: {
  formProps: PublicFormRecord;
}): React.ReactElement => {
  return (
    <div>
      {formProps ? <FormPage formData={formProps} /> : <DefaultPage />}
      {/* {console.log('hello')} */}
      <h1 className="test-h"> JavaScript is required to use this website</h1>
      <p>This browser either does not support JavaScript or scripts are being blocked.</p>
      <p>Use a web browser that supports JavaScript or allows scripts in your browser.</p>
    </div>
  );
};

const FormPage = ({ formData }: { formData: PublicFormRecord }) => {
  return (
    <div>
      <img
        src={formData.formConfig.form.brand?.logoEn}
        alt={formData.formConfig.form.brand?.logoTitleEn}
      />
    </div>
  );
};

const DefaultPage = () => {
  return (
    <div>
      <img src="/img/sig-blk-en.svg" alt="GoC" />
    </div>
  );
};

export default IncompatibleBrowser;
