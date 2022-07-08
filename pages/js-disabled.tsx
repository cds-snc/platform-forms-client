import React, { ReactElement } from "react";
import { PublicFormRecord } from "@lib/types";

const JSDisabled = ({
  formProps,
  lang,
}: {
  formProps: PublicFormRecord;
  lang: string;
}): React.ReactElement => {
  const brandImg = formProps?.formConfig.form;

  return (
    <>
      <title>
        {lang == "en"
          ? "You need JavaScript to use this website."
          : "JavaScript est requis pour consulter ce site Web."}
      </title>
      <main role="main">
        <div className="block xs:mx-4 sm:mx-4 lg:mx-16 xl:mx-32 xxl:mx-48">
          <div
            className="flex justify-around md:h-auto"
            style={{
              flexDirection: lang == "en" ? "column" : "column-reverse",
              height: "80vh",
            }}
          >
            <div id="en">
              <div className="flex justify-between items-center my-10">
                <div className="xxs:w-flag-fold xs:w-flag-5s md:w-44 w-flag-desktop">
                  {brandImg?.brand ? (
                    <img src={brandImg?.brand?.logoEn} alt={brandImg?.brand?.logoTitleEn} />
                  ) : (
                    <img src="/img/sig-blk-en.svg" alt="Symbol of the Government of Canada" />
                  )}
                </div>
                <a href="#fr">Francais</a>
              </div>
              <h1 className="md:text-small_h1 text-h1 mb-10">
                You need JavaScript to use this website.
              </h1>
              <p className="my-8">
                This browser either does not support JavaScript or scripts are being blocked.
              </p>
              <p className="my-8">
                Use a web browser that supports JavaScript or allow scripts in your browser. See the
                broswer’s help to find out more.
              </p>
            </div>
            <span className="border-b-2 border-black"></span>
            <div id="fr">
              <div className="flex justify-between items-center my-10">
                <div className="xxs:w-flag-fold xs:w-flag-5s md:w-44 w-flag-desktop">
                  {brandImg?.brand ? (
                    <img src={brandImg?.brand?.logoFr} alt={brandImg?.brand?.logoTitleFr} />
                  ) : (
                    <img src="/img/sig-blk-fr.svg" alt="Symbole du gouvernement du Canada" />
                  )}
                </div>
                <a href="#en">English</a>
              </div>
              <h1 className="md:text-small_h1 text-h1 mb-10">
                JavaScript est requis pour consulter ce site Web.
              </h1>
              <p className="my-8">
                Il est possible que votre navigateur ne prenne pas en charge JavaScript ou qu’il
                bloque les scripts.
              </p>
              <p className="my-8">
                Dans ce cas, il est recommandé d’utiliser un navigateur Web qui prend en charge
                JavaScript ou exécute des scripts. Consultez la rubrique d’aide du navigateur pour
                en savoir plus.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer formData={formProps} lang={lang} />
    </>
  );
};
const Footer = ({ formData, lang }: { formData: PublicFormRecord; lang: string }) => {
  const brandImg = formData?.formConfig?.form;
  return (
    <footer className="lg:mt-10 border-0 mt-16">
      <div className="border-t-4 border-gray-900 py-10 flex flex-col px-64 lg:px-16 xl:px-32 sm:py-2 sm:px-6">
        <div className="md:mb-10 flex self-start xxl:flex self-start">
          {lang == "en" ? (
            <a href="/en/terms-avis">Terms and conditions</a>
          ) : (
            <a href="/fr/terms-avis">modalités de service</a>
          )}
        </div>
        <div className="flex self-end sm:flex sm:self-start">
          {brandImg?.brand ? (
            <img
              alt={lang == "en" ? brandImg?.brand?.logoTitleEn : brandImg?.brand?.logoTitleFr}
              src={lang == "en" ? brandImg?.brand?.logoEn : brandImg?.brand?.logoFr}
              className="xxs:w-flag-fold xs:w-flag-5s md:w-56 w-flag-5s"
            />
          ) : (
            <img
              src={lang == "en" ? "/img/sig-blk-en.svg" : "/img/sig-blk-fr.svg"}
              alt={
                lang == "en"
                  ? "Symbol of the Government of Canada"
                  : "Symbole du gouvernement du Canada"
              }
              className="xxs:w-flag-fold xs:w-flag-5s md:w-56 w-flag-5s"
            />
          )}
        </div>
      </div>
    </footer>
  );
};

JSDisabled.getLayout = function (page: ReactElement) {
  return <>{page}</>;
};

export default JSDisabled;
