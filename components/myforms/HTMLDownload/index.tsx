import React, { ReactElement } from "react";
import { ResponseSection } from "./ResponseSection";
import { ProtectedWarning } from "./ProtectedWarning";
import Fip from "./Fip";
import { NextPageWithLayout } from "@pages/_app";
import SkipLink from "@components/globals/SkipLink";
import Footer from "./Footer";
import { FormProperties, Responses } from "@lib/types";

interface HTMLDownloadProps {
  formTemplate: FormProperties;
  formResponse: Responses;
  confirmReceiptCode: string;
  submissionID: string;
  responseID: string;
  createdAt: number;
}

const HTMLDownload: NextPageWithLayout<HTMLDownloadProps> = ({
  formTemplate,
  formResponse,
  confirmReceiptCode,
  submissionID,
  responseID,
  createdAt,
}: HTMLDownloadProps) => {
  const CopyToClipboardScript = React.createElement("script", {
    dangerouslySetInnerHTML: {
      // eslint-disable-next-line no-useless-escape
      __html: `!function(e){"object"==typeof exports&&"undefined"!=typeof module?module.exports=e():"function"==typeof define&&define.amd?define([],e):("undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this).copyToClipboard=e()}(function(){return function n(r,a,c){function i(t,e){if(!a[t]){if(!r[t]){var o="function"==typeof require&&require;if(!e&&o)return o(t,!0);if(l)return l(t,!0);throw(e=new Error("Cannot find module '"+t+"'")).code="MODULE_NOT_FOUND",e}o=a[t]={exports:{}},r[t][0].call(o.exports,function(e){return i(r[t][1][e]||e)},o,o.exports,n,r,a,c)}return a[t].exports}for(var l="function"==typeof require&&require,e=0;e<c.length;e++)i(c[e]);return i}({1:[function(e,t,o){"use strict";var d=e("toggle-selection"),f={"text/plain":"Text","text/html":"Url",default:"Text"};t.exports=function(o,n){var t,e,r,a,c=!1,i=(n=n||{}).debug||!1;try{var l=d(),s=document.createRange(),u=document.getSelection();if((e=document.createElement("span")).textContent=o,e.ariaHidden="true",e.style.all="unset",e.style.position="fixed",e.style.top=0,e.style.clip="rect(0, 0, 0, 0)",e.style.whiteSpace="pre",e.style.webkitUserSelect="text",e.style.MozUserSelect="text",e.style.msUserSelect="text",e.style.userSelect="text",e.addEventListener("copy",function(e){var t;e.stopPropagation(),n.format&&(e.preventDefault(),void 0===e.clipboardData?(i&&console.warn("unable to use e.clipboardData"),i&&console.warn("trying IE specific stuff"),window.clipboardData.clearData(),t=f[n.format]||f.default,window.clipboardData.setData(t,o)):(e.clipboardData.clearData(),e.clipboardData.setData(n.format,o))),n.onCopy&&(e.preventDefault(),n.onCopy(e.clipboardData))}),document.body.appendChild(e),s.selectNodeContents(e),u.addRange(s),!document.execCommand("copy"))throw new Error("copy command was unsuccessful");c=!0}catch(e){i&&console.error("unable to copy using execCommand: ",e),i&&console.warn("trying IE specific stuff");try{window.clipboardData.setData(n.format||"text",o),n.onCopy&&n.onCopy(window.clipboardData),c=!0}catch(e){i&&console.error("unable to copy using clipboardData: ",e),i&&console.error("falling back to prompt"),r="message"in n?n.message:"Copy to clipboard: #{key}, Enter",a=(/mac os x/i.test(navigator.userAgent)?"⌘":"Ctrl")+"+C",t=r.replace(/#{\s*key\s*}/g,a),window.prompt(t,o)}}finally{u&&("function"==typeof u.removeRange?u.removeRange(s):u.removeAllRanges()),e&&document.body.removeChild(e),l()}return c}},{"toggle-selection":2}],2:[function(e,t,o){t.exports=function(){var t=document.getSelection();if(!t.rangeCount)return function(){};for(var e=document.activeElement,o=[],n=0;n<t.rangeCount;n++)o.push(t.getRangeAt(n));switch(e.tagName.toUpperCase()){case"INPUT":case"TEXTAREA":e.blur();break;default:e=null}return t.removeAllRanges(),function(){"Caret"===t.type&&t.removeAllRanges(),t.rangeCount||o.forEach(function(e){t.addRange(e)}),e&&e.focus()}}},{}]},{},[1])(1)});`,
    },
  });
  return (
    <>
      <h1 className="sr-only">{`${formTemplate.titleEn} - ${formTemplate.titleFr}`}</h1>
      <div className="mt-14" />
      <ProtectedWarning lang="en" />
      <Fip language="en" />
      <div className="mt-14" />
      <ResponseSection
        confirmReceiptCode={confirmReceiptCode}
        lang={"en"}
        responseID={responseID}
        submissionID={submissionID}
        submissionDate={createdAt}
        formTemplate={formTemplate}
        formResponse={formResponse}
      />
      <div className="mt-20" />
      <ProtectedWarning lang="fr" />
      <Fip language="fr" />
      <div className="mt-14" />
      <ResponseSection
        confirmReceiptCode={confirmReceiptCode}
        lang={"fr"}
        responseID={responseID}
        submissionID={submissionID}
        submissionDate={createdAt}
        formTemplate={formTemplate}
        formResponse={formResponse}
      />
      {CopyToClipboardScript}
    </>
  );
};

HTMLDownload.getLayout = (page: ReactElement) => {
  return (
    <div className="flex flex-col h-full">
      <SkipLink />

      <div id="page-container">
        <main id="content">{page}</main>
      </div>
      <Footer />
    </div>
  );
};

export default HTMLDownload;
