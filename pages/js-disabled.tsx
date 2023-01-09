/* eslint-disable @next/next/no-img-element  */
//Component will be rendered if it's inside <noscript> tag when next/image is used.
import React, { ReactElement } from "react";
import { BrandProperties } from "@lib/types";
import Footer from "@components/globals/Footer";

const JSDisabled = ({
  brand,
  lang,
}: {
  brand: BrandProperties;
  lang: string | undefined;
}): React.ReactElement => {
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
                  {brand ? <img src={brand?.logoEn} alt={brand?.logoTitleEn} /> : <></>}
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
                  {brand ? <img src={brand?.logoFr} alt={brand?.logoTitleFr} /> : <></>}
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
      <Footer brand={brand} lang={lang} />
    </>
  );
};

JSDisabled.getLayout = function (page: ReactElement) {
  return <>{page}</>;
};

export default JSDisabled;
