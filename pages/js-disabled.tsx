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
      <div className="main-div">
        <div
          className="content-div"
          style={{
            flexDirection: lang == "en" ? "column" : "column-reverse",
            justifyContent: "space-around",
          }}
        >
          <div id="en">
            <div className="fip">
              <div className="flag">
                {brandImg?.brand ? (
                  <img src={brandImg?.brand?.logoEn} alt={brandImg?.brand?.logoTitleEn} />
                ) : (
                  <img src="/img/sig-blk-en.svg" alt="GoC" />
                )}
              </div>
              <a href="#fr">Francais</a>
            </div>
            <h1>You need JavaScript to use this website.</h1>
            <p>This browser either does not support JavaScript or scripts are being blocked.</p>
            <p>
              Use a web browser that supports JavaScript or allow scripts in your browser. See the
              broswer’s help to find out more.
            </p>
          </div>
          <span className="div-border"></span>
          <div id="fr">
            <div className="fip">
              <div className="flag">
                {brandImg?.brand ? (
                  <img src={brandImg?.brand?.logoFr} alt={brandImg?.brand?.logoTitleFr} />
                ) : (
                  <img src="/img/sig-blk-fr.svg" alt="GoC" />
                )}
              </div>
              <a href="#en">English</a>
            </div>
            <h1>JavaScript est requis pour consulter ce site Web.</h1>
            <p>
              Il est possible que votre navigateur ne prenne pas en charge JavaScript ou qu’il
              bloque les scripts.
            </p>
            <p>
              Dans ce cas, il est recommandé d’utiliser un navigateur Web qui prend en charge
              JavaScript ou exécute des scripts. Consultez la rubrique d’aide du navigateur pour en
              savoir plus.
            </p>
          </div>
        </div>
      </div>
      <Footer formData={formProps} lang={lang} />
    </>
  );
};
const Footer = ({ formData, lang }: { formData: PublicFormRecord; lang: string }) => {
  const brandImg = formData?.formConfig?.form;
  return (
    <footer className="incompatible-footer">
      <div className="incompatible-footer-container">
        <div className="terms-class">
          {lang == "en" ? (
            <a href="/en/terms-avis">Terms and conditions</a>
          ) : (
            <a href="/fr/terms-avis">modalités de service</a>
          )}
        </div>
        <div className="fip-class">
          {brandImg?.brand ? (
            <img
              alt={lang == "en" ? brandImg?.brand?.logoTitleEn : brandImg?.brand?.logoTitleFr}
              src={lang == "en" ? brandImg?.brand?.logoEn : brandImg?.brand?.logoFr}
            />
          ) : lang == "en" ? (
            <img src="/img/sig-blk-en.svg" alt="Symbol of the Government of Canada" />
          ) : (
            <img src="/img/sig-blk-fr.svg" alt="Symbole du gouvernement du Canada" />
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
