import { type SecurityAttribute } from "@lib/types";
import { type Language } from "@lib/types/form-builder-types";

export const NextSteps = ({
  securityAttribute,
  language,
  host,
  formId,
}: {
  securityAttribute?: SecurityAttribute;
  language?: Language;
  host: string;
  formId: string;
}) => {
  return (
    <>
      <div className="hidden">
        {securityAttribute && securityAttribute}
        {language && language}
      </div>
      <div className="mb-10 rounded-lg bg-gcds-green-100 p-4">
        <h2 className="!mb-4 !text-2xl font-bold underline">What to do next - </h2>
        <div className="grid grid-cols-2 gap-28">
          <div>
            <div className="mb-4 rounded-lg border-2 border-slate-400 p-4">
              <h3 className="!mb-2 !text-2xl font-bold">Resume completing your form</h3>
              <p>
                <a href={`${host}${lang}/id/${formId}`}>Upload this file to resume</a> completing
                your form
              </p>
            </div>

            <div className="rounded-lg border-2 border-slate-400 p-4">
              <h3 className="!mb-2 !text-2xl font-bold">Save a copy for the future</h3>
              <p>Keep a receipt of your answers to review in the future</p>
            </div>
          </div>

          <div>
            <h3 className="!my-6 !text-2xl font-bold">Keep your information safe</h3>
            <p className="max-w-56 italic">
              Make sure to keep this file in a secure spot on your device
            </p>
          </div>
        </div>
      </div>
    </>
  );
};
