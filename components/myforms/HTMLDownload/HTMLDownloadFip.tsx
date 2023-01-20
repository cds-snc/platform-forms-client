import React from "react";

const Fip = ({ language }: { language: string }) => {
  const logo = "/img/sig-blk-" + language + ".svg";

  const linkUrl = language === "fr" ? "http://canada.ca/fr.html" : "http://canada.ca/en.html";

  const logoTitle =
    language === "fr" ? "Symbole du gouvernement du Canada" : "Symbol of the Government of Canada";

  return (
    <div data-testid="fip" className="gc-fip">
      <div className="canada-flag">
        <a
          href={linkUrl}
          aria-label={
            language === "fr"
              ? "Gouvernement du Canada page d'accueil"
              : "Government of Canada Home page"
          }
        >
          <picture>
            <img src={logo} alt={logoTitle} />
          </picture>
        </a>
      </div>
      <div className="inline-flex gap-4"></div>
    </div>
  );
};

export default Fip;
