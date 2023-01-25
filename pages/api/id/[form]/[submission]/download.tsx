/* eslint-disable no-useless-escape */
import { NextApiRequest, NextApiResponse, NextComponentType, NextPageContext } from "next";
import { logMessage } from "@lib/logger";
import { middleware, cors, sessionExists } from "@lib/middleware";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand, QueryCommandInput } from "@aws-sdk/lib-dynamodb";
import { FormRecord, MiddlewareProps, WithRequired } from "@lib/types";
import { AccessControlError, createAbility } from "@lib/privileges";
import React from "react";
import { renderToPipeableStream } from "react-dom/server";
import { getFullTemplateByID } from "@lib/templates";
import HTMLDownloadFile from "@components/myforms/HTMLDownload";
import BaseApp from "@pages/_app";
import { Router } from "next/router";

// Temporary Import for Testing
import LemonadeStand from "../../../../../__fixtures__/accessibilityTestForm.json";

/**
 * Handler for the retrieval API route. This function simply calls the relevant function depending on the HTTP method
 * @param req - The HTTP request object
 * @param res - The HTTP response object
 */

const allowedMethods = ["GET"];

const handler = async (req: NextApiRequest, res: NextApiResponse, props: MiddlewareProps) => {
  const formID = req.query.form;
  const submissionID = req.query.submission;

  const { session } = props as WithRequired<MiddlewareProps, "session">;

  if (Array.isArray(formID) || !formID) return res.status(400).json({ error: "Bad Request" });

  try {
    /*
    const formTemplate = await getFullTemplateByID(createAbility(session.user.privileges), formID);

    if (formTemplate === null) return res.status(404).json({ error: 'Form Not Found' });

    const documentClient = connectToDynamo();

    const getItemsDbParams: QueryCommandInput = {
      TableName: 'Vault',

      ExpressionAttributeValues: {
        ':formID': formID,
        ':submissionID': submissionID,
      },
      KeyConditionExpression: 'FormID = :formID AND SubmissionID = :submissionID',
      ProjectionExpression: 'FormID,SubmissionID,FormSubmission,Retrieved,SecurityAttribute, CreatedAt',
    };
    const queryCommand = new QueryCommand(getItemsDbParams);

    const response = await documentClient.send(queryCommand);

    // If the SubmissionID does not exist return a 404
    if (response.Items === undefined || response.Items.length === 0)
      return res.status(404).json({ error: 'Submission not Found' });

    const parsedResponse = response.Items.map(
      ({
        FormID: formID,
        SubmissionID: submissionID,
        FormSubmission: formSubmission,
        SecurityAttribute: securityAttribute,
        CreatedAt: createdAt
      }) => ({
        formID,
        submissionID,
        formSubmission: JSON.parse(formSubmission),
           securityAttribute,
           createdAt,
        // In the future add Form Sumbission Files here
        // fileAttachments: getFileAttachments(submissionID, formSubmission),
        // In the future add the Confirmation Code here
        // confirmationCode
      })
    )[0];
    */

    // This will eventually be replaced by the user friendly random name on the submission object
    const responseID = "ABC-123";
    const confirmReceiptCode = "123456789-TODO";
    const formTemplate = LemonadeStand.form;
    const createdAt = Date.now();

    const formResponse = {
      "2": "Bryan Robitaille",
      "3": "English",
      "5": "Home Sweet Home",
      "6": "",
      "7": "Sweet but tangy",
      "8": "Driveway",
      "9": "",
      "11": [
        {
          "0": "Sugar",
          "1": "2 lbs",
        },
        {
          "0": "Lemons",
          "1": "4 lbs",
        },
      ],
      "12": ["Cups", "Napkins"],
      "14": "Yes",
    };

    //TODO ..

    const pageProps = {
      formResponse,
      formTemplate,
      confirmReceiptCode,
      submissionID,
      responseID,
      createdAt,
      pathname: "/",
      query: {},
      _nextI18Next: {
        initialLocale: "en",
        ns: ["my-forms", "common"],
        userConfig: {
          i18n: {
            defaultLocale: "en",
            locales: ["en", "fr"],
          },
          returnNull: false,
          localePath: "/Users/BryanR/repos/form_client/public/static/locales",
          reloadOnPrerender: true,
          default: {
            i18n: {
              defaultLocale: "en",
              locales: ["en", "fr"],
            },
            returnNull: false,
            localePath: "/Users/BryanR/repos/form_client/public/static/locales",
            reloadOnPrerender: true,
          },
        },
      },
      isHTMLFileDownload: true,
    };

    res.setHeader("Content-Disposition", `attachment; filename=${responseID}.html`);

    let didError = false;

    const stream = renderToPipeableStream(
      <>
        <html lang="en">
          {/* eslint-disable-next-line @next/next/no-head-element */}
          <head>
            <meta charSet="utf-8" />
            <title>{`${formTemplate.titleEn} - ${formTemplate.titleFr}`}</title>
            <style dangerouslySetInnerHTML={{ __html: css }}></style>
          </head>
          <body>
            <BaseApp
              pageProps={pageProps}
              Component={HTMLDownloadFile as unknown as NextComponentType<NextPageContext>}
              router={{} as unknown as Router}
              __N_SSG={true}
            />
          </body>
        </html>
      </>,
      {
        onShellReady() {
          // The content above all Suspense boundaries is ready.
          // If something errored before we started streaming, we set the error code appropriately.
          res.statusCode = didError ? 500 : 200;
          res.setHeader("Content-type", "text/html");
          stream.pipe(res);
        },
        onShellError(error) {
          // Something errored before we could complete the shell so we emit an alternative shell.
          res.statusCode = 500;
          res.send("<!doctype html><p>Oh Oh...</p>");
        },
        onError(err) {
          didError = true;
          logMessage.error(err);
        },
      }
    );

    logMessage.info(
      `user:${session?.user.email} retrieved form responses ${submissionID} from form ID:${formID}}`
    );

    // return res.status(200).send(htmlFile);
  } catch (error) {
    if (error instanceof AccessControlError) return res.status(403).json({ error: "Forbidden" });
    logMessage.error(error as Error);
    res.status(500).json({ error: "Error on Server Side when fetching form's responses" });
  }
};

/**
 * Helper function to instantiate DynamoDB and Document client.
 * https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/dynamodb-example-document-client.html
 */
function connectToDynamo(): DynamoDBDocumentClient {
  //Create dynamodb client
  const db = new DynamoDBClient({
    region: process.env.AWS_REGION ?? "ca-central-1",
    endpoint: process.env.LOCAL_AWS_ENDPOINT,
  });

  return DynamoDBDocumentClient.from(db);
}

//TODO replace with minified CSS - below copy+paste from local dev output
const css = `
@charset "UTF-8";
/*
! tailwindcss v3.2.1 | MIT License | https://tailwindcss.com
*/
/*
1. Prevent padding and border from affecting element width. (https://github.com/mozdevs/cssremedy/issues/4)
2. Allow adding a border to an element by just adding a border-width. (https://github.com/tailwindcss/tailwindcss/pull/116)
*/
*,
::before,
::after {
  box-sizing: border-box; /* 1 */
  border-width: 0; /* 2 */
  border-style: solid; /* 2 */
  border-color: #e5e7eb; /* 2 */
}
::before,
::after {
  --tw-content: '';
}
/*
1. Use a consistent sensible line-height in all browsers.
2. Prevent adjustments of font size after orientation changes in iOS.
3. Use a more readable tab size.
4. Use the user's configured sans font-family by default.
*/
html {
  line-height: 1.5; /* 1 */
  -webkit-text-size-adjust: 100%; /* 2 */ /* 3 */
  tab-size: 4; /* 3 */
  font-family: Lato, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"; /* 4 */
}
/*
1. Remove the margin in all browsers.
2. Inherit line-height from html so users can set them as a class directly on the html element.
*/
body {
  margin: 0; /* 1 */
  line-height: inherit; /* 2 */
}
/*
1. Add the correct height in Firefox.
2. Correct the inheritance of border color in Firefox. (https://bugzilla.mozilla.org/show_bug.cgi?id=190655)
3. Ensure horizontal rules are visible by default.
*/
hr {
  height: 0; /* 1 */
  color: inherit; /* 2 */
  border-top-width: 1px; /* 3 */
}
/*
Add the correct text decoration in Chrome, Edge, and Safari.
*/
abbr:where([title]) {
  -webkit-text-decoration: underline dotted;
          text-decoration: underline dotted;
}
/*
Remove the default font size and weight for headings.
*/
h1,
h2,
h3,
h4,
h5,
h6 {
  font-size: inherit;
  font-weight: inherit;
}
/*
Reset links to optimize for opt-in styling instead of opt-out.
*/
a {
  color: inherit;
  text-decoration: inherit;
}
/*
Add the correct font weight in Edge and Safari.
*/
b,
strong {
  font-weight: bolder;
}
/*
1. Use the user's configured mono font family by default.
2. Correct the odd em font sizing in all browsers.
*/
code,
kbd,
samp,
pre {
  font-family: monospace; /* 1 */
  font-size: 1em; /* 2 */
}
/*
Add the correct font size in all browsers.
*/
small {
  font-size: 80%;
}
/*
Prevent sub and sup elements from affecting the line height in all browsers.
*/
sub,
sup {
  font-size: 75%;
  line-height: 0;
  position: relative;
  vertical-align: baseline;
}
sub {
  bottom: -0.25em;
}
sup {
  top: -0.5em;
}
/*
1. Remove text indentation from table contents in Chrome and Safari. (https://bugs.chromium.org/p/chromium/issues/detail?id=999088, https://bugs.webkit.org/show_bug.cgi?id=201297)
2. Correct table border color inheritance in all Chrome and Safari. (https://bugs.chromium.org/p/chromium/issues/detail?id=935729, https://bugs.webkit.org/show_bug.cgi?id=195016)
3. Remove gaps between table borders by default.
*/
table {
  text-indent: 0; /* 1 */
  border-color: inherit; /* 2 */
  border-collapse: collapse; /* 3 */
}
/*
1. Change the font styles in all browsers.
2. Remove the margin in Firefox and Safari.
3. Remove default padding in all browsers.
*/
button,
input,
optgroup,
select,
textarea {
  font-family: inherit; /* 1 */
  font-size: 100%; /* 1 */
  font-weight: inherit; /* 1 */
  line-height: inherit; /* 1 */
  color: inherit; /* 1 */
  margin: 0; /* 2 */
  padding: 0; /* 3 */
}
/*
Remove the inheritance of text transform in Edge and Firefox.
*/
button,
select {
  text-transform: none;
}
/*
1. Correct the inability to style clickable types in iOS and Safari.
2. Remove default button styles.
*/
button,
[type='button'],
[type='reset'],
[type='submit'] {
  -webkit-appearance: button; /* 1 */
  background-color: transparent; /* 2 */
  background-image: none; /* 2 */
}
/*
Use the modern Firefox focus style for all focusable elements.
*/
:-moz-focusring {
  outline: auto;
}
/*
Remove the additional :invalid styles in Firefox. (https://github.com/mozilla/gecko-dev/blob/2f9eacd9d3d995c937b4251a5557d95d494c9be1/layout/style/res/forms.css#L728-L737)
*/
:-moz-ui-invalid {
  box-shadow: none;
}
/*
Add the correct vertical alignment in Chrome and Firefox.
*/
progress {
  vertical-align: baseline;
}
/*
Correct the cursor style of increment and decrement buttons in Safari.
*/
::-webkit-inner-spin-button,
::-webkit-outer-spin-button {
  height: auto;
}
/*
1. Correct the odd appearance in Chrome and Safari.
2. Correct the outline style in Safari.
*/
[type='search'] {
  -webkit-appearance: textfield; /* 1 */
  outline-offset: -2px; /* 2 */
}
/*
Remove the inner padding in Chrome and Safari on macOS.
*/
::-webkit-search-decoration {
  -webkit-appearance: none;
}
/*
1. Correct the inability to style clickable types in iOS and Safari.
2. Change font properties to inherit in Safari.
*/
::-webkit-file-upload-button {
  -webkit-appearance: button; /* 1 */
  font: inherit; /* 2 */
}
/*
Add the correct display in Chrome and Safari.
*/
summary {
  display: list-item;
}
/*
Removes the default spacing and border for appropriate elements.
*/
blockquote,
dl,
dd,
h1,
h2,
h3,
h4,
h5,
h6,
hr,
figure,
p,
pre {
  margin: 0;
}
fieldset {
  margin: 0;
  padding: 0;
}
legend {
  padding: 0;
}
ol,
ul,
menu {
  list-style: none;
  margin: 0;
  padding: 0;
}
/*
Prevent resizing textareas horizontally by default.
*/
textarea {
  resize: vertical;
}
/*
1. Reset the default placeholder opacity in Firefox. (https://github.com/tailwindlabs/tailwindcss/issues/3300)
2. Set the default placeholder color to the user's configured gray 400 color.
*/
input::-webkit-input-placeholder, textarea::-webkit-input-placeholder {
  opacity: 1; /* 1 */
  color: #9ca3af; /* 2 */
}
input::placeholder,
textarea::placeholder {
  opacity: 1; /* 1 */
  color: #9ca3af; /* 2 */
}
/*
Set the default cursor for buttons.
*/
button,
[role="button"] {
  cursor: pointer;
}
/*
Make sure disabled buttons don't get the pointer cursor.
*/
:disabled {
  cursor: default;
}
/*
1. Make replaced elements display: block by default. (https://github.com/mozdevs/cssremedy/issues/14)
2. Add vertical-align: middle to align replaced elements more sensibly by default. (https://github.com/jensimmons/cssremedy/issues/14#issuecomment-634934210)
   This can trigger a poorly considered lint error in some tools but is included by design.
*/
img,
svg,
video,
canvas,
audio,
iframe,
embed,
object {
  display: block; /* 1 */
  vertical-align: middle; /* 2 */
}
/*
Constrain images and videos to the parent width and preserve their intrinsic aspect ratio. (https://github.com/mozdevs/cssremedy/issues/14)
*/
img,
video {
  max-width: 100%;
  height: auto;
}
/* Make elements with the HTML hidden attribute stay hidden by default */
[hidden] {
  display: none;
}
/* latin */
@font-face {
    font-family: "Lato";
    font-style: normal;
    font-weight: 400;
    src: local("Lato"), url(/_next/static/media/Lato-Regular.4291f48c.ttf) format("ttf");
  }
/* latin */
@font-face {
    font-family: "Noto Sans";
    font-style: normal;
    font-weight: 400;
    src: url(/_next/static/media/NotoSans-Regular.c983f2f0.ttf) format("ttf");
  }
/* latin */
@font-face {
    font-family: "Noto Sans";
    font-style: bold;
    font-weight: 700;
    src: url(/_next/static/media/NotoSans-Bold.c428375a.ttf) format("ttf");
  }
*, ::before, ::after{
  --tw-border-spacing-x: 0;
  --tw-border-spacing-y: 0;
  --tw-translate-x: 0;
  --tw-translate-y: 0;
  --tw-rotate: 0;
  --tw-skew-x: 0;
  --tw-skew-y: 0;
  --tw-scale-x: 1;
  --tw-scale-y: 1;
  --tw-pan-x:  ;
  --tw-pan-y:  ;
  --tw-pinch-zoom:  ;
  --tw-scroll-snap-strictness: proximity;
  --tw-ordinal:  ;
  --tw-slashed-zero:  ;
  --tw-numeric-figure:  ;
  --tw-numeric-spacing:  ;
  --tw-numeric-fraction:  ;
  --tw-ring-inset:  ;
  --tw-ring-offset-width: 0px;
  --tw-ring-offset-color: #fff;
  --tw-ring-color: rgb(117 185 224 / 0.5);
  --tw-ring-offset-shadow: 0 0 #0000;
  --tw-ring-shadow: 0 0 #0000;
  --tw-shadow: 0 0 #0000;
  --tw-shadow-colored: 0 0 #0000;
  --tw-blur:  ;
  --tw-brightness:  ;
  --tw-contrast:  ;
  --tw-grayscale:  ;
  --tw-hue-rotate:  ;
  --tw-invert:  ;
  --tw-saturate:  ;
  --tw-sepia:  ;
  --tw-drop-shadow:  ;
  --tw-backdrop-blur:  ;
  --tw-backdrop-brightness:  ;
  --tw-backdrop-contrast:  ;
  --tw-backdrop-grayscale:  ;
  --tw-backdrop-hue-rotate:  ;
  --tw-backdrop-invert:  ;
  --tw-backdrop-opacity:  ;
  --tw-backdrop-saturate:  ;
  --tw-backdrop-sepia:  ;
}
::-webkit-backdrop{
  --tw-border-spacing-x: 0;
  --tw-border-spacing-y: 0;
  --tw-translate-x: 0;
  --tw-translate-y: 0;
  --tw-rotate: 0;
  --tw-skew-x: 0;
  --tw-skew-y: 0;
  --tw-scale-x: 1;
  --tw-scale-y: 1;
  --tw-pan-x:  ;
  --tw-pan-y:  ;
  --tw-pinch-zoom:  ;
  --tw-scroll-snap-strictness: proximity;
  --tw-ordinal:  ;
  --tw-slashed-zero:  ;
  --tw-numeric-figure:  ;
  --tw-numeric-spacing:  ;
  --tw-numeric-fraction:  ;
  --tw-ring-inset:  ;
  --tw-ring-offset-width: 0px;
  --tw-ring-offset-color: #fff;
  --tw-ring-color: rgb(117 185 224 / 0.5);
  --tw-ring-offset-shadow: 0 0 #0000;
  --tw-ring-shadow: 0 0 #0000;
  --tw-shadow: 0 0 #0000;
  --tw-shadow-colored: 0 0 #0000;
  --tw-blur:  ;
  --tw-brightness:  ;
  --tw-contrast:  ;
  --tw-grayscale:  ;
  --tw-hue-rotate:  ;
  --tw-invert:  ;
  --tw-saturate:  ;
  --tw-sepia:  ;
  --tw-drop-shadow:  ;
  --tw-backdrop-blur:  ;
  --tw-backdrop-brightness:  ;
  --tw-backdrop-contrast:  ;
  --tw-backdrop-grayscale:  ;
  --tw-backdrop-hue-rotate:  ;
  --tw-backdrop-invert:  ;
  --tw-backdrop-opacity:  ;
  --tw-backdrop-saturate:  ;
  --tw-backdrop-sepia:  ;
}
::backdrop{
  --tw-border-spacing-x: 0;
  --tw-border-spacing-y: 0;
  --tw-translate-x: 0;
  --tw-translate-y: 0;
  --tw-rotate: 0;
  --tw-skew-x: 0;
  --tw-skew-y: 0;
  --tw-scale-x: 1;
  --tw-scale-y: 1;
  --tw-pan-x:  ;
  --tw-pan-y:  ;
  --tw-pinch-zoom:  ;
  --tw-scroll-snap-strictness: proximity;
  --tw-ordinal:  ;
  --tw-slashed-zero:  ;
  --tw-numeric-figure:  ;
  --tw-numeric-spacing:  ;
  --tw-numeric-fraction:  ;
  --tw-ring-inset:  ;
  --tw-ring-offset-width: 0px;
  --tw-ring-offset-color: #fff;
  --tw-ring-color: rgb(117 185 224 / 0.5);
  --tw-ring-offset-shadow: 0 0 #0000;
  --tw-ring-shadow: 0 0 #0000;
  --tw-shadow: 0 0 #0000;
  --tw-shadow-colored: 0 0 #0000;
  --tw-blur:  ;
  --tw-brightness:  ;
  --tw-contrast:  ;
  --tw-grayscale:  ;
  --tw-hue-rotate:  ;
  --tw-invert:  ;
  --tw-saturate:  ;
  --tw-sepia:  ;
  --tw-drop-shadow:  ;
  --tw-backdrop-blur:  ;
  --tw-backdrop-brightness:  ;
  --tw-backdrop-contrast:  ;
  --tw-backdrop-grayscale:  ;
  --tw-backdrop-hue-rotate:  ;
  --tw-backdrop-invert:  ;
  --tw-backdrop-opacity:  ;
  --tw-backdrop-saturate:  ;
  --tw-backdrop-sepia:  ;
}
.container{
  width: 100%;
  margin-right: auto;
  margin-left: auto;
}
* {
  box-sizing: border-box;
}
html,
body,
#__next,
#safeHydrate {
  height: 100%;
}
footer,
header{
  padding-left: 8rem;
  padding-right: 8rem;
}
@media (max-width: 768px){
  footer,
header{
    padding-left: 4rem;
    padding-right: 4rem;
  }
}
@media (max-width: 550px){
  footer,
header{
    padding-left: 2rem;
    padding-right: 2rem;
  }
}
@media (max-width: 320px){
  footer,
header{
    padding-left: 1rem;
    padding-right: 1rem;
  }
}
#page-container{
  margin-left: 8rem;
  margin-right: 8rem;
  flex-shrink: 0;
  flex-grow: 1;
  flex-basis: auto;
}
@media (max-width: 768px){
  #page-container{
    margin-left: 4rem;
    margin-right: 4rem;
  }
}
@media (max-width: 550px){
  #page-container{
    margin-left: 2rem;
    margin-right: 2rem;
  }
}
@media (max-width: 320px){
  #page-container{
    margin-left: 1rem;
    margin-right: 1rem;
  }
}
.gc-richText{
  margin-top: 0.5rem;
  width: 50rem;
}
@media (max-width: 992px){
  .gc-richText{
    width: 30rem;
  }
}
@media (max-width: 768px){
  .gc-richText{
    width: 25rem;
  }
}
@media (max-width: 550px){
  .gc-richText{
    margin-top: 10px;
    width: 24rem;
  }
}
@media (max-width: 450px){
  .gc-richText{
    width: 15rem;
  }
}
@media (max-width: 320px){
  .gc-richText{
    width: 14rem;
  }
}
@media (max-width: 290px){
  .gc-richText{
    width: 11.5rem;
  }
}
.gc-homepage{
  font-size: 20px;
  line-height: 28px;
}
@media (max-width: 550px){
  .gc-homepage{
    font-size: 16px;
    line-height: 22px;
  }
}
.gc-homepage div{
  margin-bottom: 3.5rem;
  max-width: 75ch;
}
@media (max-width: 550px){
  .gc-homepage div{
    margin-bottom: 3rem;
  }
}
.gc-homepage div:last-of-type{
  margin-bottom: 5rem;
}
@media (max-width: 550px){
  .gc-homepage div:last-of-type{
    margin-bottom: 3.5rem;
  }
}
.gc-homepage h2{
  margin-bottom: 1.25rem;
  font-size: 30px;
  line-height: 38px;
}
@media (max-width: 550px){
  .gc-homepage h2{
    font-size: 20px;
    line-height: 28px;
  }
}
.gc-ul{
  list-style-type: disc;
  font-size: 20px;
  line-height: 28px;
}
@media (max-width: 550px){
  .gc-ul{
    font-size: 16px;
    line-height: 22px;
  }
}
.gc-ul li{
  margin-left: 1.5rem;
  display: block;
}
ul.custom {
  list-style: none;
  padding-left: 1em;
  margin-left: 0;
}
ul.custom li {
  margin: 0.5rem 0;
}
ul.custom li:before {
  content: "•";
  margin: 0 0.5em 0.1em -0.9em;
  font-size: 22px;
}
.gc-ul li:last-of-type{
  margin-bottom: 3rem;
}
/* Adjustments for tailwind defaults that conflict with the node-starter-app defaults */
ol{
  list-style-type: decimal;
  padding-left: 2.5rem;
}
ul{
  list-style-type: disc;
  padding-left: 2.5rem;
}
li ul{
  list-style-type: circle;
}
a:visited{
  --tw-text-opacity: 1;
  color: rgb(99 0 199 / var(--tw-text-opacity));
}
a,
.gc-button-link{
  --tw-text-opacity: 1;
  color: rgb(40 65 98 / var(--tw-text-opacity));
  text-decoration-line: underline;
}
a:hover,
.gc-button-link:hover{
  --tw-text-opacity: 1;
  color: rgb(5 53 210 / var(--tw-text-opacity));
}
a:focus,
.gc-button-link:focus {
  outline: none;
  box-shadow: 4px 0 0 0 #303fc3, -4px 0 0 0 #303fc3;
  --tw-bg-opacity: 1;
  background-color: rgb(48 63 195 / var(--tw-bg-opacity));
  --tw-text-opacity: 1;
  color: rgb(255 255 255 / var(--tw-text-opacity));
}
a:active {
  box-shadow: 4px 0 0 0 #1b2736, -4px 0 0 0 #1b2736;
  --tw-bg-opacity: 1;
  background-color: rgb(27 39 54 / var(--tw-bg-opacity));
  --tw-text-opacity: 1;
  color: rgb(255 255 255 / var(--tw-text-opacity));
  text-decoration-line: underline;
}
.link-list li{
  margin-bottom: 0.5rem;
}
.link-list li:last-of-type{
  margin-bottom: 0px;
}
body {
  margin: 0;
  font-size: 1.25em;
  font-family: "Noto Sans", sans-serif;
  line-height: 1.65;
}
h1,
h2,
h3,
h4,
h5,
h6 {
  font-family: "Lato", sans-serif;
  line-height: 1.33;
  font-weight: 600;
}
h1, .gc-h1{
  margin-bottom: 4rem;
  border-bottom-width: 2px;
  --tw-border-opacity: 1;
  border-color: rgb(177 14 30 / var(--tw-border-opacity));
  padding-bottom: 0.5rem;
  font-size: 34px;
  line-height: 44px;
  font-weight: 700;
}
@media (max-width: 550px){
  h1, .gc-h1{
    margin-bottom: 2.5rem;
    font-size: 24px;
    line-height: 28px;
  }
}
h2, .gc-h2{
  padding-bottom: 1.5rem;
  font-size: 30px;
  line-height: 38px;
  font-weight: 700;
}
@media (max-width: 550px){
  h2, .gc-h2{
    font-size: 20px;
    line-height: 28px;
  }
}
h3, .gc-h3{
  margin-bottom: 1.5rem;
  padding-bottom: 0px;
  font-size: 26px;
  line-height: 32px;
  font-weight: 700;
}
@media (max-width: 450px){
  h3, .gc-h3{
    font-size: 18px;
    line-height: 22px;
  }
}
.outer-container {
  position: relative;
  min-height: 100vh;
  width: 100%;
}
.email-preview > * {
  all: revert;
}
.email-preview ul {
  padding-left: 20px !important;
}
@supports not (display: grid) {
  input {
    border: 1px solid #000;
  }
}
.gc-fieldset ul{
  margin-bottom: 3.5rem;
}
.gc-alert,
.gc-error-message{
  margin-bottom: 0.5rem;
  width: 100%;
  padding-top: 0px;
  padding-bottom: 0px;
  font-size: 20px;
  line-height: 28px;
  --tw-text-opacity: 1;
  color: rgb(185 28 28 / var(--tw-text-opacity));
}
@media (max-width: 550px){
  .gc-alert,
.gc-error-message{
    font-size: 16px;
    line-height: 22px;
  }
}
.gc-error-message + .gc-input-text,
.gc-error-message + .gc-textarea,
.gc-error-message + .gc-dropdown{
  --tw-border-opacity: 1;
  border-color: rgb(185 28 28 / var(--tw-border-opacity));
}
.gc-alert{
  margin-bottom: 3.5rem;
  width: 83.333333%;
  padding-top: 2rem;
  padding-bottom: 2rem;
  padding-left: 3rem;
  padding-right: 3rem;
}
@media (max-width: 992px){
  .gc-alert{
    width: 100%;
  }
}
.gc-alert.gc-alert--validation, .gc-alert.gc-alert--error{
  border-width: 2px;
  --tw-border-opacity: 1;
  border-color: rgb(177 14 30 / var(--tw-border-opacity));
}
.gc-alert.gc-alert--validation:focus, .gc-alert.gc-alert--error:focus {
  box-shadow: inset 0 0 0 2px #b10e1e;
  outline: 2px solid transparent;
  outline-offset: 2px;
}
.gc-alert.gc-alert--validation:focus-within, .gc-alert.gc-alert--error:focus-within {
  box-shadow: inset 0 0 0 2px #b10e1e;
  outline: 2px solid transparent;
  outline-offset: 2px;
}
.gc-alert.gc-alert--success{
  --tw-bg-opacity: 1;
  background-color: rgb(209 250 229 / var(--tw-bg-opacity));
}
.gc-alert .gc-alert__body{
  --tw-text-opacity: 1;
  color: rgb(0 0 0 / var(--tw-text-opacity));
}
.gc-alert .gc-alert__body h3{
  margin-bottom: 1.25rem;
  --tw-text-opacity: 1;
  color: rgb(177 14 30 / var(--tw-text-opacity));
}
.gc-alert .gc-alert__body ol{
  list-style-position: inside;
}
.gc-alert .gc-alert__body ol li{
  margin-bottom: 0.5rem;
}
.gc-ordered-list{
  margin-left: 0px;
  font-weight: 400;
}
.gc-ordered-list .gc-error-link{
  margin-left: 0.5rem;
  --tw-text-opacity: 1;
  color: rgb(30 58 138 / var(--tw-text-opacity));
}
.gc-ordered-list .gc-error-link:focus {
  box-shadow: 4px 0 0 0 #303fc3, -4px 0 0 0 #303fc3;
  --tw-bg-opacity: 1;
  background-color: rgb(48 63 195 / var(--tw-bg-opacity));
  --tw-text-opacity: 1;
  color: rgb(255 255 255 / var(--tw-text-opacity));
}
.gc-ordered-list .gc-error-link:active {
  box-shadow: 4px 0 0 0 #1b2736, -4px 0 0 0 #1b2736;
  --tw-bg-opacity: 1;
  background-color: rgb(27 39 54 / var(--tw-bg-opacity));
  --tw-text-opacity: 1;
  color: rgb(255 255 255 / var(--tw-text-opacity));
  text-decoration-line: underline;
}
.gc-dropdown {
  background-image: url(/_next/static/media/arrow-down.c0382983.svg);
  margin-top: 0.5rem;
  margin-bottom: 3.5rem;
  display: block;
  width: 50%;
  -webkit-appearance: none;
          appearance: none;
  border-width: 2px;
  --tw-border-opacity: 1;
  border-color: rgb(11 12 12 / var(--tw-border-opacity));
  background-position: center right 15px;
  background-repeat: no-repeat;
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
  padding-left: 1.25rem;
  padding-right: 2.5rem;
  font-size: 20px;
  line-height: 28px;
  --tw-text-opacity: 1;
  color: rgb(74 85 104 / var(--tw-text-opacity));
}
@media (max-width: 550px){
  .gc-dropdown{
    width: 100%;
    font-size: 16px;
    line-height: 22px;
  }
}
.gc-dropdown:focus{
  --tw-border-opacity: 1;
  border-color: rgb(48 63 195 / var(--tw-border-opacity));
  --tw-shadow: inset 0 0 0 2px #0535d2;
  --tw-shadow-colored: inset 0 0 0 2px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
  outline: 2px solid transparent;
  outline-offset: 2px;
}
.gc-p, .gc-richText p{
  margin-bottom: 2.5rem;
  width: 100%;
  font-size: 20px;
  line-height: 28px;
}
@media (max-width: 550px){
  .gc-p, .gc-richText p{
    font-size: 16px;
    line-height: 22px;
  }
}
.gc-description{
  margin-bottom: 0.75rem;
  width: 75%;
  font-size: 16px;
  line-height: 22px;
  --tw-text-opacity: 1;
  color: rgb(88 88 88 / var(--tw-text-opacity));
}
@media (max-width: 992px){
  .gc-description{
    width: 100%;
  }
}
@media (max-width: 550px){
  .gc-description{
    font-size: 12px;
    line-height: 14px;
  }
}
.gc-richText ul,
.gc-richText ol{
  margin-bottom: 2.5rem;
}
.gc-richText ol{
  list-style-position: inside;
}
.gc-richText a:visited{
  --tw-text-opacity: 1;
  color: rgb(99 0 199 / var(--tw-text-opacity));
}
.gc-richText a{
  --tw-text-opacity: 1;
  color: rgb(40 65 98 / var(--tw-text-opacity));
  text-decoration-line: underline;
}
.gc-richText a:hover{
  --tw-text-opacity: 1;
  color: rgb(5 53 210 / var(--tw-text-opacity));
}
.gc-richText a:focus {
  outline: none;
  box-shadow: 4px 0 0 0 #303fc3, -4px 0 0 0 #303fc3;
  --tw-bg-opacity: 1;
  background-color: rgb(48 63 195 / var(--tw-bg-opacity));
  --tw-text-opacity: 1;
  color: rgb(255 255 255 / var(--tw-text-opacity));
}
.gc-richText a:active {
  box-shadow: 4px 0 0 0 #1b2736, -4px 0 0 0 #1b2736;
  --tw-bg-opacity: 1;
  background-color: rgb(27 39 54 / var(--tw-bg-opacity));
  --tw-text-opacity: 1;
  color: rgb(255 255 255 / var(--tw-text-opacity));
  text-decoration-line: underline;
}
.gc-item-row{
  margin-top: 0px;
  border-top-width: 2px;
  --tw-border-opacity: 1;
  border-color: rgb(11 12 12 / var(--tw-border-opacity));
  --tw-bg-opacity: 1;
  background-color: rgb(255 255 255 / var(--tw-bg-opacity));
  padding-left: 0px;
  padding-right: 0px;
  padding-top: 4rem;
  padding-bottom: 0.75rem;
}
.gc-item-row h3{
  margin-bottom: 2.5rem;
  padding-bottom: 0px;
  font-size: 26px;
  line-height: 32px;
  font-weight: 700;
}
@media (max-width: 550px){
  .gc-item-row h3{
    font-size: 18px;
    line-height: 22px;
  }
}
.gc-form{
  max-width: 75ch;
}
.gc-form-group{
  margin-bottom: 0px;
}
.gc-form-group .gc-input-radio:last-of-type,
.gc-form-group .gc-input-checkbox:last-of-type{
  padding-bottom: 0px;
}
@media (max-width: 550px){
  .gc-form-group .gc-input-radio:last-of-type,
.gc-form-group .gc-input-checkbox:last-of-type{
    margin-bottom: 2.5rem;
  }
}
.gc-section-header, .gc-richText h4{
  margin-bottom: 4rem;
  margin-top: 3rem;
  --tw-bg-opacity: 1;
  background-color: rgb(244 244 244 / var(--tw-bg-opacity));
  padding: 1.5rem;
  font-size: 30px;
  line-height: 38px;
  font-weight: 700;
}
@media (max-width: 550px){
  .gc-section-header, .gc-richText h4{
    font-size: 20px;
    line-height: 28px;
  }
}
.gc-legend{
  margin-bottom: 3.5rem;
  font-size: 30px;
  line-height: 38px;
  font-weight: 700;
}
@media (max-width: 550px){
  .gc-legend{
    font-size: 20px;
    line-height: 28px;
  }
}
.gc-button{
  margin: 0px;
  margin-right: 0.5rem;
  width: 15rem;
  cursor: pointer;
  border-bottom-width: 4px;
  --tw-border-opacity: 1;
  border-color: rgb(17 24 39 / var(--tw-border-opacity));
  --tw-bg-opacity: 1;
  background-color: rgb(0 112 60 / var(--tw-bg-opacity));
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
  padding-left: 1.25rem;
  padding-right: 1.25rem;
  font-size: 20px;
  line-height: 28px;
  font-weight: 700;
  --tw-text-opacity: 1;
  color: rgb(249 250 251 / var(--tw-text-opacity));
  text-decoration-line: none;
  outline: 2px solid transparent;
  outline-offset: 2px;
}
@media (max-width: 550px){
  .gc-button{
    width: 100%;
    font-size: 16px;
    line-height: 22px;
  }
}
.gc-button:hover{
  --tw-bg-opacity: 1;
  background-color: rgb(0 89 48 / var(--tw-bg-opacity));
}
.gc-button:focus {
  box-shadow: 0 0 0 2px white;
  outline: solid 2px #303fc3;
  outline-offset: 2px;
  --tw-bg-opacity: 1;
  background-color: rgb(48 63 195 / var(--tw-bg-opacity));
  --tw-text-opacity: 1;
  color: rgb(249 250 251 / var(--tw-text-opacity));
}
.gc-button:active {
  box-shadow: 0 0 0 2px white;
  outline: solid 2px #1b2736;
  outline-offset: 2px;
  --tw-bg-opacity: 1;
  background-color: rgb(27 39 54 / var(--tw-bg-opacity));
}
.gc-button--icon{
  height: 3rem;
  width: 3rem;
  border-radius: 0.375rem;
  padding-top: 0px;
  padding-bottom: 0px;
  padding-left: 0px;
  padding-right: 0px;
  font-size: 26px;
  line-height: 32px;
}
@media (max-width: 550px){
  .gc-button--icon{
    height: 2.5rem;
    width: 2.5rem;
    font-size: 20px;
    line-height: 28px;
  }
}
.gc-button--secondary{
  margin-bottom: 3.5rem;
  margin-right: 1.25rem;
  --tw-bg-opacity: 1;
  background-color: rgb(209 213 219 / var(--tw-bg-opacity));
  --tw-text-opacity: 1;
  color: rgb(0 0 0 / var(--tw-text-opacity));
}
.gc-button--secondary:hover{
  --tw-bg-opacity: 1;
  background-color: rgb(160 174 192 / var(--tw-bg-opacity));
}
.gc-button--blue{
  margin-left: auto;
  margin-right: auto;
  height: 4rem;
  border-radius: 0.5rem;
  --tw-bg-opacity: 1;
  background-color: rgb(38 55 74 / var(--tw-bg-opacity));
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
  padding-left: 1.5rem;
  padding-right: 1.5rem;
  --tw-text-opacity: 1;
  color: rgb(255 255 255 / var(--tw-text-opacity));
  --tw-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);;
  --tw-shadow-colored: 0 1px 3px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}
.gc-button--blue:hover{
  --tw-bg-opacity: 1;
  background-color: rgb(51 80 117 / var(--tw-bg-opacity));
}
.gc-button--blue:focus{
  --tw-bg-opacity: 1;
  background-color: rgb(48 63 195 / var(--tw-bg-opacity));
  outline-style: solid;
  outline-width: 3px;
  outline-offset: 2px;
  outline-color: #303FC3;
}
.gc-button--blue:active{
  top: 0.125rem;
  --tw-text-opacity: 1;
  color: rgb(255 255 255 / var(--tw-text-opacity));
}
.gc-button--blue:visited{
  top: 0.125rem;
  --tw-text-opacity: 1;
  color: rgb(255 255 255 / var(--tw-text-opacity));
}
.gc-button--destructive{
  margin-bottom: 3.5rem;
  margin-right: 1.25rem;
  --tw-bg-opacity: 1;
  background-color: rgb(137 36 6 / var(--tw-bg-opacity));
}
.gc-button--destructive:hover{
  --tw-bg-opacity: 1;
  background-color: rgb(78 21 4 / var(--tw-bg-opacity));
}
.gc-label{
  margin-bottom: 0.5rem;
  display: block;
  width: 75%;
  font-size: 20px;
  line-height: 28px;
  font-weight: 700;
}
@media (max-width: 992px){
  .gc-label{
    width: 100%;
  }
}
@media (max-width: 550px){
  .gc-label{
    font-size: 16px;
    line-height: 22px;
  }
}
.gc-label.required > span{
  --tw-text-opacity: 1;
  color: rgb(185 28 28 / var(--tw-text-opacity));
  content: " *";
}
.gc-plain-text{
  margin-top: 1.25rem;
  margin-bottom: 1.25rem;
  width: 100%;
}
.gc-textarea{
  margin-top: 0.5rem;
  display: block;
  height: 10rem;
  width: 75%;
  border-width: 2px;
  border-style: solid;
  --tw-border-opacity: 1;
  border-color: rgb(11 12 12 / var(--tw-border-opacity));
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  font-size: 20px;
  line-height: 28px;
  --tw-text-opacity: 1;
  color: rgb(74 85 104 / var(--tw-text-opacity));
}
@media (max-width: 550px){
  .gc-textarea{
    width: 100%;
    font-size: 16px;
    line-height: 22px;
  }
}
.gc-textarea.full-height{
  height: auto;
}
.gc-textarea:focus{
  --tw-border-opacity: 1;
  border-color: rgb(48 63 195 / var(--tw-border-opacity));
  --tw-shadow: inset 0 0 0 2px #0535d2;
  --tw-shadow-colored: inset 0 0 0 2px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
  outline: 2px solid transparent;
  outline-offset: 2px;
}
.focus-group{
  margin-bottom: 3.5rem;
}
.focus-group:focus-within .gc-label,
.focus-group:focus-within .gc-description{
  --tw-text-opacity: 1;
  color: rgb(48 63 195 / var(--tw-text-opacity));
}
.gc-form-group-context {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  margin: 0 !important;
  padding: 0 !important;
  overflow: hidden !important;
  clip: rect(0 0 0 0) !important;
  -webkit-clip-path: inset(50%) !important;
  clip-path: inset(50%) !important;
  border: 0 !important;
  white-space: nowrap !important;
}
.gc-input-text {
  border: solid 2px black;
  margin-top: 0.5rem;
  width: 24rem;
  border-width: 2px;
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  font-size: 20px;
  line-height: 28px;
  --tw-text-opacity: 1;
  color: rgb(74 85 104 / var(--tw-text-opacity));
}
@media (max-width: 550px){
  .gc-input-text{
    width: 100%;
    font-size: 16px;
    line-height: 22px;
  }
}
.gc-input-text:focus{
  --tw-border-opacity: 1;
  border-color: rgb(48 63 195 / var(--tw-border-opacity));
  --tw-shadow: inset 0 0 0 2px #0535d2;
  --tw-shadow-colored: inset 0 0 0 2px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
  outline: 2px solid transparent;
  outline-offset: 2px;
}
.gc-input-checkbox{
  display: block;
}
.gc-input-checkbox .gc-input-checkbox__input {
  background-repeat: round;
  position: absolute;
  margin-right: 1.5rem;
  height: 2.5rem;
  width: 2.5rem;
  border-width: 2px;
  border-color: transparent;
  --tw-bg-opacity: 1;
  background-color: rgb(255 255 255 / var(--tw-bg-opacity));
}
@media (max-width: 550px){
  .gc-input-checkbox .gc-input-checkbox__input{
    margin-right: 1rem;
  }
}
.gc-input-checkbox .gc-input-checkbox__input + .gc-checkbox-label{
  position: relative;
  cursor: pointer;
  padding: 0px;
}
.gc-input-checkbox .gc-input-checkbox__input:focus{
  outline: 2px solid transparent;
  outline-offset: 2px;
}
.gc-input-checkbox .gc-input-checkbox__input:focus + .gc-checkbox-label span{
  --tw-text-opacity: 1;
  color: rgb(48 63 195 / var(--tw-text-opacity));
}
.gc-input-checkbox .gc-input-checkbox__input:focus + .gc-checkbox-label:before{
  border-width: 4px;
  --tw-border-opacity: 1;
  border-color: rgb(48 63 195 / var(--tw-border-opacity));
  outline: 2px solid transparent;
  outline-offset: 2px;
}
.gc-input-checkbox .gc-input-checkbox__input + .gc-checkbox-label:before {
  content: "";
  margin-right: 1.5rem;
  display: inline-block;
  height: 2.5rem;
  width: 2.5rem;
  border-width: 2px;
  --tw-border-opacity: 1;
  border-color: rgb(11 12 12 / var(--tw-border-opacity));
  --tw-bg-opacity: 1;
  background-color: rgb(255 255 255 / var(--tw-bg-opacity));
}
@media (max-width: 550px){
  .gc-input-checkbox .gc-input-checkbox__input + .gc-checkbox-label:before{
    margin-right: 1rem;
  }
}
.gc-input-checkbox .gc-input-checkbox__input:checked + .gc-checkbox-label:after {
  background-repeat: no-repeat;
  content: "";
  background-image: url(/_next/static/media/checkmark.bb103ee9.svg);
  position: absolute;
  left: 0.5rem;
  height: 1.5rem;
  width: 1.5rem;
}
.gc-input-checkbox .gc-input-checkbox__input:focus + .gc-checkbox-label:after {
  background-image: url(/_next/static/media/blue-checkmark.bba4cc9a.svg);
}
.gc-input-radio,
.gc-input-checkbox{
  display: flex;
  align-items: center;
  padding-left: 0px;
  padding-right: 0px;
  padding-top: 0.75rem;
  padding-bottom: 0.25rem;
}
.gc-radio-label,
.gc-checkbox-label{
  display: flex;
  align-items: center;
  font-size: 20px;
  line-height: 28px;
  font-weight: 400;
}
@media (max-width: 550px){
  .gc-radio-label,
.gc-checkbox-label{
    font-size: 16px;
    line-height: 22px;
  }
}
.gc-radio-label .checkbox-label-text,
.gc-radio-label .radio-label-text,
.gc-checkbox-label .checkbox-label-text,
.gc-checkbox-label .radio-label-text{
  margin-top: 0.5rem;
  width: 50rem;
}
@media (max-width: 992px){
  .gc-radio-label .checkbox-label-text,
.gc-radio-label .radio-label-text,
.gc-checkbox-label .checkbox-label-text,
.gc-checkbox-label .radio-label-text{
    width: 30rem;
  }
}
@media (max-width: 768px){
  .gc-radio-label .checkbox-label-text,
.gc-radio-label .radio-label-text,
.gc-checkbox-label .checkbox-label-text,
.gc-checkbox-label .radio-label-text{
    width: 25rem;
  }
}
@media (max-width: 550px){
  .gc-radio-label .checkbox-label-text,
.gc-radio-label .radio-label-text,
.gc-checkbox-label .checkbox-label-text,
.gc-checkbox-label .radio-label-text{
    margin-top: 10px;
    width: 24rem;
  }
}
@media (max-width: 450px){
  .gc-radio-label .checkbox-label-text,
.gc-radio-label .radio-label-text,
.gc-checkbox-label .checkbox-label-text,
.gc-checkbox-label .radio-label-text{
    width: 15rem;
  }
}
@media (max-width: 320px){
  .gc-radio-label .checkbox-label-text,
.gc-radio-label .radio-label-text,
.gc-checkbox-label .checkbox-label-text,
.gc-checkbox-label .radio-label-text{
    width: 14rem;
  }
}
@media (max-width: 290px){
  .gc-radio-label .checkbox-label-text,
.gc-radio-label .radio-label-text,
.gc-checkbox-label .checkbox-label-text,
.gc-checkbox-label .radio-label-text{
    width: 11.5rem;
  }
}
.gc-radio__input{
  position: absolute;
  margin-right: 1.5rem;
  height: 2.5rem;
  width: 2.5rem;
  border-color: transparent;
  --tw-bg-opacity: 1;
  background-color: rgb(255 255 255 / var(--tw-bg-opacity));
}
@media (max-width: 550px){
  .gc-radio__input{
    margin-right: 1rem;
  }
}
.gc-radio__input + .gc-radio-label{
  position: relative;
  cursor: pointer;
  padding: 0px;
}
.gc-radio__input:focus{
  outline: 2px solid transparent;
  outline-offset: 2px;
}
.gc-radio__input:focus + .gc-radio-label span{
  --tw-text-opacity: 1;
  color: rgb(48 63 195 / var(--tw-text-opacity));
}
.gc-radio__input:focus + .gc-radio-label:before{
  border-width: 4px;
  --tw-border-opacity: 1;
  border-color: rgb(48 63 195 / var(--tw-border-opacity));
  outline: 2px solid transparent;
  outline-offset: 2px;
}
.gc-radio__input + .gc-radio-label:before {
  content: "";
  margin-right: 1.5rem;
  display: inline-block;
  height: 2.5rem;
  width: 2.5rem;
  border-radius: 9999px;
  border-width: 2px;
  --tw-border-opacity: 1;
  border-color: rgb(11 12 12 / var(--tw-border-opacity));
  --tw-bg-opacity: 1;
  background-color: rgb(255 255 255 / var(--tw-bg-opacity));
}
@media (max-width: 550px){
  .gc-radio__input + .gc-radio-label:before{
    margin-right: 1rem;
  }
}
.gc-radio__input:checked + .gc-radio-label:after {
  content: "";
  background-image: url(/_next/static/media/black-circle.488b8714.svg);
  position: absolute;
  left: 10px;
  height: 1.25rem;
  width: 1.25rem;
}
.gc-radio__input:focus + .gc-radio-label:after {
  background-image: url(/_next/static/media/blue-circle.231694e8.svg);
}
.gc-file-input{
  margin-top: 0.5rem;
  margin-bottom: 3.5rem;
  width: 100%;
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
  padding-right: 0.5rem;
  font-size: 20px;
  line-height: 28px;
  --tw-text-opacity: 1;
  color: rgb(74 85 104 / var(--tw-text-opacity));
}
@media (max-width: 550px){
  .gc-file-input{
    font-size: 16px;
    line-height: 22px;
  }
}
.gc-file-input:focus{
  --tw-border-opacity: 1;
  border-color: rgb(48 63 195 / var(--tw-border-opacity));
  --tw-shadow: inset 0 0 0 2px #0535d2;
  --tw-shadow-colored: inset 0 0 0 2px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
  outline: 2px solid transparent;
  outline-offset: 2px;
}
.gc-file-input.is-disabled {
  opacity: 0.5;
  pointer-events: none;
}
.gc-file-input-upload-button{
  margin-bottom: 0px;
  display: inline-block;
  text-align: center;
}
.gc-file-input-file-selected{
  display: inline-block;
}
.gc-file-input [type=file] {
  display: none;
}
.page-preview-form h1::before,
.page-en-preview-form h1::before,
.page-fr-preview-form h1::before {
  content: "[Preview/Prévisualisation]";
  margin-bottom: 2.5rem;
  display: block;
  font-weight: 700;
  --tw-text-opacity: 1;
  color: rgb(4 120 87 / var(--tw-text-opacity));
}
.page-preview-form .gc-button[type=submit],
.page-en-preview-form .gc-button[type=submit],
.page-fr-preview-form .gc-button[type=submit] {
  display: none;
}
.validation-message{
  --tw-text-opacity: 1;
  color: rgb(239 68 68 / var(--tw-text-opacity));
}
.gc-form-confirmation p{
  font-size: 20px;
  line-height: 28px;
}
@media (max-width: 550px){
  .gc-form-confirmation p{
    font-size: 16px;
    line-height: 22px;
  }
}
.confirmation-content{
  position: relative;
}
.confirmation-list{
  margin-bottom: 2.5rem;
  list-style-position: inside;
}
.gc-confirmation-banner{
  margin-bottom: 2.5rem;
  width: 83.333333%;
  --tw-bg-opacity: 1;
  background-color: rgb(229 231 235 / var(--tw-bg-opacity));
  padding-top: 4rem;
  padding-bottom: 4rem;
  padding-left: 5rem;
  padding-right: 5rem;
}
@media (max-width: 992px){
  .gc-confirmation-banner{
    width: 100%;
  }
}
@media (max-width: 550px){
  .gc-confirmation-banner{
    padding-top: 2.5rem;
    padding-bottom: 2.5rem;
    padding-left: 2.5rem;
    padding-right: 2.5rem;
  }
}
.gc-confirmation-banner h2{
  margin-bottom: 1.5rem;
  font-size: 30px;
  line-height: 38px;
}
@media (max-width: 550px){
  .gc-confirmation-banner h2{
    font-size: 20px;
    line-height: 28px;
  }
}
.gc-confirmation-banner p:first-of-type{
  margin-bottom: 1.25rem;
}
@media (max-width: 550px){
  .gc-confirmation-banner p:first-of-type{
    font-size: 16px;
    line-height: 22px;
  }
}
.gc-confirmation-banner p:last-of-type{
  font-weight: 700;
}
@media (max-width: 550px){
  .gc-confirmation-banner p:last-of-type{
    font-size: 16px;
    line-height: 22px;
  }
}
.gc-last-logout-time{
  align-items: center;
  padding-bottom: 2.5rem;
  padding-top: 0.75rem;
  font-family: Lato, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
  font-size: 16px;
  line-height: 22px;
  font-weight: 400;
  font-style: normal;
  line-height: 125%;
}
.gc-go-to-login-btn a{
  border-radius: 0.25rem;
  --tw-bg-opacity: 1;
  background-color: rgb(117 185 224 / var(--tw-bg-opacity));
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  padding-left: 1rem;
  padding-right: 1rem;
  font-weight: 700;
  --tw-text-opacity: 1;
  color: rgb(255 255 255 / var(--tw-text-opacity));
}
.gc-go-to-login-btn a:hover{
  --tw-bg-opacity: 1;
  background-color: rgb(51 80 117 / var(--tw-bg-opacity));
}
.gc-go-to-login-btn a {
  text-decoration: none !important;
  background-color: #26374a;
}
.form-builder {
  /*--------------------------------------------*
  * Element dropdown
  *--------------------------------------------*/
  /*--------------------------------------------*
  * Multiple Choice
  *--------------------------------------------*/
  /*--------------------------------------------*
  * Dialog modal (popup i.e. delete confirmation)
  *--------------------------------------------*/
  /*--------------------------------------------*
  * Rich text editor
  *--------------------------------------------*/
  /*********************
  * link editor   *
  *********************/
  /*--------------------------------------------*
  * Required field
  *--------------------------------------------*/
  /* move to tailwind when >=3.1 https://tailwindcss.com/blog/tailwindcss-v3-1#arbitrary-values-but-for-variants*/
  /* end form builder styles */
}
.form-builder .builder-element-dropdown {
  width: 250px;
}
.form-builder .builder-element-dropdown .separator {
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  margin: 8px 0;
}
.form-builder .builder-element-dropdown .header-button {
  padding-left: 20px;
  padding-top: 10px;
  padding-bottom: 10px;
  display: flex;
  background-color: #fff;
  border-radius: 4px;
  border: 1.5px solid #000000;
  width: 100%;
  line-height: 24px;
}
.form-builder .builder-element-dropdown .header-button:focus, .form-builder .builder-element-dropdown .header-button[aria-expanded=true] {
  border-color: #303fc3;
  box-shadow: 0 0 0 2.5px #303fc3;
  outline: 0;
}
.form-builder .builder-element-dropdown .selected {
  width: 100%;
  display: flex;
  justify-content: space-between;
}
.form-builder .builder-element-dropdown .selected svg {
  margin-right: 20px;
}
.form-builder .builder-element-dropdown ul {
  box-shadow: 0 1px 2px 0 rgba(60, 64, 67, 0.3), 0 2px 6px 2px rgba(60, 64, 67, 0.15);
  padding: 0px;
  padding-top: 10px;
  padding-bottom: 10px;
  border-radius: 4px;
  margin: 0px;
  margin-top: 10px;
  list-style: none;
  background-color: #fff;
  position: absolute;
  width: 250px;
}
.form-builder .builder-element-dropdown li {
  display: flex;
  align-content: flex-start;
  cursor: pointer;
  padding-left: 20px;
  padding-right: 26px;
  padding-bottom: 8px;
  padding-top: 8px;
}
.form-builder .builder-element-dropdown li .text {
  margin-left: 10px;
  line-height: 24px;
  color: #202124;
}
.form-builder .builder-element-dropdown li .highlighted {
  color: #fff;
}
.form-builder .builder-element-dropdown li .icon {
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: left;
  overflow: hidden;
  display: inline-block;
  position: relative;
  padding-top: 2px;
}
.form-builder .builder-element-dropdown li .icon svg {
  height: 20px;
  width: 20px;
}
.form-builder .builder-element-dropdown li .highlighted {
  color: #fff;
}
.form-builder .builder-element-dropdown .highlighted {
  background: #718096;
}
.form-builder .builder-element-dropdown .highlighted svg path {
  fill: #fff;
}
.form-builder .multiple-choice-wrapper {
  display: block;
  float: none;
  clear: left;
  position: relative;
  padding: 0 0 0 38px;
  margin-bottom: 10px;
}
.form-builder .multiple-choice-wrapper input {
  position: absolute;
  cursor: pointer;
  left: 0;
  top: 0;
  width: 38px;
  height: 38px;
  z-index: 1;
  margin: 0;
  zoom: 1;
  filter: alpha(opacity=0);
  opacity: 0;
}
.form-builder .multiple-choice-wrapper label {
  cursor: pointer;
  padding: 0 10px 5px 10px;
  display: block;
  touch-action: manipulation;
}
.form-builder .multiple-choice-wrapper input[type=radio] + label::before {
  content: "";
  border: 2px solid;
  background: transparent;
  width: 34px;
  height: 34px;
  position: absolute;
  top: 0;
  left: 0;
  border-radius: 50%;
}
.form-builder .multiple-choice-wrapper input[type=radio] + label::after {
  content: "";
  border: 10px solid;
  width: 0;
  height: 0;
  position: absolute;
  top: 7px;
  left: 7px;
  border-radius: 50%;
  zoom: 1;
  filter: alpha(opacity=0);
  opacity: 0;
}
.form-builder .multiple-choice-wrapper input[type=checkbox] + label::before {
  content: "";
  border: 2px solid;
  background: transparent;
  width: 34px;
  height: 34px;
  position: absolute;
  top: 0;
  left: 0;
  border-radius: 4px;
}
.form-builder .multiple-choice-wrapper input[type=checkbox] + label::after {
  content: "";
  border: solid;
  border-width: 0 0 4px 4px;
  background: transparent;
  border-top-color: transparent;
  width: 21px;
  height: 13px;
  position: absolute;
  top: 7px;
  left: 7px;
  -webkit-transform: rotate(-45deg);
  transform: rotate(-45deg);
  zoom: 1;
  filter: alpha(opacity=0);
  opacity: 0;
}
.form-builder .multiple-choice-wrapper input[type=radio]:focus + label::before {
  box-shadow: 0 0 0 4px #303fc3;
}
.form-builder .multiple-choice-wrapper input[type=checkbox]:focus + label::before {
  box-shadow: 0 0 0 3px #303fc3;
}
.form-builder .multiple-choice-wrapper input:checked + label::after {
  zoom: 1;
  filter: alpha(opacity=100);
  opacity: 1;
}
.form-builder .multiple-choice-wrapper input:disabled {
  cursor: default;
}
.form-builder .multiple-choice-wrapper input:disabled + label {
  zoom: 1;
  filter: alpha(opacity=50);
  opacity: 0.5;
  cursor: default;
}
.form-builder .modal-dialog {
  padding: 0;
  background: transparent;
  margin: 0;
  background-clip: padding-box;
  width: 100%;
  max-width: none;
  max-height: none;
  height: 100%;
}
.form-builder .modal-dialog .modal-content {
  width: 750px; /* TODO: fix this for mobile */
  margin: 1.75rem auto;
  border: 1.5px solid #000000;
  box-shadow: 0px 4px 0px -1px #000000;
  background: #ffffff;
  border-radius: 12px;
  outline: 0;
  max-height: none;
  overflow-x: scroll;
  position: relative;
  display: flex;
  flex-direction: column;
  pointer-events: auto;
}
.form-builder .modal-dialog .modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 15px;
}
.form-builder .modal-dialog .modal-title {
  padding-bottom: 15px;
}
.form-builder .modal-dialog .modal-body {
  position: relative;
  flex: 1 1 auto;
  padding: 15px;
}
.form-builder .modal-dialog .modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 15px;
  border-top: 1px solid #cacaca;
}
.form-builder .rich-text-wrapper {
  height: 100%;
}
.form-builder .rich-text-wrapper .editor-input {
  padding: 20px;
}
.form-builder .rich-text-wrapper .editor-input:focus {
  outline: 2px #303fc3 solid;
}
.form-builder .rich-text-wrapper .editor-input p:first-child {
  margin-top: 0;
}
.form-builder .rich-text-wrapper .editor-input p {
  margin: 20px 0;
}
.form-builder .rich-text-wrapper .editor-input .editor-nested-listitem {
  list-style-type: none;
}
.form-builder .rich-text-wrapper .editor-input .editor-list-ol {
  padding-left: 20px;
}
.form-builder .toolbar-container {
  border-bottom: 1px solid #ddd;
  background-color: #f7f7f7;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  padding: 10px;
}
.form-builder .toolbar-container:focus-within {
  margin: -2px;
  border: 2px solid #015ecc;
}
.form-builder .toolbar-container button {
  padding: 4px;
  border: 1.5px solid transparent;
  border-radius: 4px;
  margin-right: 5px;
}
.form-builder .toolbar-container button svg {
  display: block;
}
.form-builder .toolbar-container button.active {
  border: 1.5px solid #015ecc;
}
.form-builder .link-editor {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 10;
  max-width: 400px;
  width: 100%;
  background-color: #fff;
  border: 2px solid black;
  border-radius: 8px;
}
.form-builder .link-editor button.active,
.form-builder .toolbar button.active {
  background-color: #fff;
}
.form-builder .link-editor .link-input {
  display: inline-block;
  width: calc(100% - 24px);
  box-sizing: border-box;
  margin: 8px 12px;
  padding: 8px 12px;
  border-radius: 8px;
  background-color: #eee;
  font-size: 15px;
  color: #050505;
  border: 0;
  outline: 0;
  position: relative;
  font-family: inherit;
}
.form-builder .link-editor button.link-edit {
  background-size: 16px;
  background-position: center;
  background-repeat: no-repeat;
  width: 35px;
  vertical-align: -0.25em;
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  cursor: pointer;
}
.form-builder .link-editor .link-input span {
  color: #216fdb;
  text-decoration: none;
  display: block;
  white-space: nowrap;
  overflow: hidden;
  margin-right: 30px;
  text-overflow: ellipsis;
}
.form-builder .link-editor .font-size-wrapper,
.form-builder .link-editor .font-family-wrapper {
  display: flex;
  margin: 0 4px;
}
.form-builder .link-editor select {
  padding: 6px;
  border: none;
  background-color: rgba(0, 0, 0, 0.0745098039);
  border-radius: 4px;
}
.form-builder .required-checkbox span {
  display: inline-block;
  margin-left: 10px;
}
.form-builder .required-checkbox label {
  padding-top: 4px;
}
.gc-fip{
  margin-top: 5rem;
  margin-bottom: 5rem;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}
@media (max-width: 768px){
  .gc-fip{
    margin-top: 2.5rem;
    margin-bottom: 2.5rem;
    flex-direction: column-reverse;
    align-items: flex-start;
  }
}
.gc-fip a{
  display: block;
}
.gc-language-toggle{
  text-align: right;
  font-size: 20px;
  line-height: 28px;
}
@media (max-width: 550px){
  .gc-language-toggle{
    font-size: 16px;
    line-height: 22px;
  }
}
.gc-language-toggle label {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  margin: 0 !important;
  padding: 0 !important;
  overflow: hidden !important;
  clip: rect(0 0 0 0) !important;
  -webkit-clip-path: inset(50%) !important;
  clip-path: inset(50%) !important;
  border: 0 !important;
  white-space: nowrap !important;
}
.gc-language-toggle button{
  border-width: 0;
  background-color: transparent;
  --tw-text-opacity: 1;
  color: rgb(40 65 98 / var(--tw-text-opacity));
  text-decoration-line: underline;
  --tw-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
  --tw-shadow-colored: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}
.gc-language-toggle button:hover{
  --tw-text-opacity: 1;
  color: rgb(5 53 210 / var(--tw-text-opacity));
}
.gc-language-toggle button:focus {
  outline: none;
  box-shadow: 4px 0 0 0 #303fc3, -4px 0 0 0 #303fc3;
  --tw-bg-opacity: 1;
  background-color: rgb(48 63 195 / var(--tw-bg-opacity));
  --tw-text-opacity: 1;
  color: rgb(255 255 255 / var(--tw-text-opacity));
}
.gc-language-toggle button:active {
  box-shadow: 4px 0 0 0 #1b2736, -4px 0 0 0 #1b2736;
  --tw-bg-opacity: 1;
  background-color: rgb(27 39 54 / var(--tw-bg-opacity));
  --tw-text-opacity: 1;
  color: rgb(255 255 255 / var(--tw-text-opacity));
  text-decoration-line: underline;
}
header .canada-flag{
  margin-top: 0px;
  width: 22.5rem;
}
@media (max-width: 768px){
  header .canada-flag{
    margin-top: 2.5rem;
  }
}
@media (max-width: 550px){
  header .canada-flag{
    width: 18rem;
  }
}
@media (max-width: 320px){
  header .canada-flag{
    width: 16.5rem;
  }
}
@media (max-width: 290px){
  header .canada-flag{
    width: 15rem;
  }
}
header .canada-flag a:hover:hover{
  --tw-bg-opacity: 1;
  background-color: rgb(255 255 255 / var(--tw-bg-opacity));
}
header .canada-flag a:focus {
  outline: 3px solid #303fc3;
  outline-offset: 1px;
  --tw-bg-opacity: 1;
  background-color: rgb(255 255 255 / var(--tw-bg-opacity));
}
header .canada-flag a:active{
  --tw-bg-opacity: 1;
  background-color: rgb(255 255 255 / var(--tw-bg-opacity));
}
.visually-hidden {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  margin: 0 !important;
  padding: 0 !important;
  overflow: hidden !important;
  clip: rect(0 0 0 0) !important;
  -webkit-clip-path: inset(50%) !important;
  clip-path: inset(50%) !important;
  border: 0 !important;
  white-space: nowrap !important;
}
#skip-link-container {
  width: 100%;
  position: absolute;
  z-index: 5;
  text-align: center;
  top: 10px;
}
#skip-link-container #skip-link {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  white-space: nowrap;
}
#skip-link-container #skip-link:focus {
  position: static;
  padding: 5px;
  width: auto;
  height: auto;
  overflow: auto;
  text-align: center;
}
.sr-only{
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
.invisible{
  visibility: hidden;
}
.static{
  position: static;
}
.fixed{
  position: fixed;
}
.absolute{
  position: absolute;
}
.relative{
  position: relative;
}
.top-40{
  top: 10rem;
}
.top-0{
  top: 0px;
}
.-top-10{
  top: -2.5rem;
}
.-left-14{
  left: -3.5rem;
}
.left-0{
  left: 0px;
}
.top-8{
  top: 2rem;
}
.right-0{
  right: 0px;
}
.bottom-0{
  bottom: 0px;
}
.-left-\[1rem\]{
  left: -1rem;
}
.-top-\[13rem\]{
  top: -13rem;
}
.top-\[35px\]{
  top: 35px;
}
.right-\[30px\]{
  right: 30px;
}
.z-10{
  z-index: 10;
}
.float-right{
  float: right;
}
.clear-both{
  clear: both;
}
.m-auto{
  margin: auto;
}
.m-2{
  margin: 0.5rem;
}
.m-0{
  margin: 0px;
}
.m-1{
  margin: 0.25rem;
}
.-m-0{
  margin: -0px;
}
.-m-px{
  margin: -1px;
}
.\!m-0{
  margin: 0px !important;
}
.-m-0\.5{
  margin: -0.125rem;
}
.mx-auto{
  margin-left: auto;
  margin-right: auto;
}
.my-10{
  margin-top: 2.5rem;
  margin-bottom: 2.5rem;
}
.mx-4{
  margin-left: 1rem;
  margin-right: 1rem;
}
.mx-3{
  margin-left: 0.75rem;
  margin-right: 0.75rem;
}
.mx-7{
  margin-left: 1.75rem;
  margin-right: 1.75rem;
}
.my-7{
  margin-top: 1.75rem;
  margin-bottom: 1.75rem;
}
.my-2{
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
}
.\!my-0{
  margin-top: 0px !important;
  margin-bottom: 0px !important;
}
.mb-14{
  margin-bottom: 3.5rem;
}
.mt-4{
  margin-top: 1rem;
}
.mt-14{
  margin-top: 3.5rem;
}
.mr-8{
  margin-right: 2rem;
}
.mt-8{
  margin-top: 2rem;
}
.mb-10{
  margin-bottom: 2.5rem;
}
.mb-8{
  margin-bottom: 2rem;
}
.-mt-6{
  margin-top: -1.5rem;
}
.-mt-8{
  margin-top: -2rem;
}
.ml-60{
  margin-left: 15rem;
}
.mt-6{
  margin-top: 1.5rem;
}
.mt-20{
  margin-top: 5rem;
}
.mb-6{
  margin-bottom: 1.5rem;
}
.mt-\[-2rem\]{
  margin-top: -2rem;
}
.mb-16{
  margin-bottom: 4rem;
}
.mb-4{
  margin-bottom: 1rem;
}
.mb-2{
  margin-bottom: 0.5rem;
}
.mr-2{
  margin-right: 0.5rem;
}
.mb-0{
  margin-bottom: 0px;
}
.mb-20{
  margin-bottom: 5rem;
}
.mt-16{
  margin-top: 4rem;
}
.ml-4{
  margin-left: 1rem;
}
.mb-1{
  margin-bottom: 0.25rem;
}
.mt-5{
  margin-top: 1.25rem;
}
.mb-5{
  margin-bottom: 1.25rem;
}
.mt-10{
  margin-top: 2.5rem;
}
.ml-5{
  margin-left: 1.25rem;
}
.mt-0{
  margin-top: 0px;
}
.mt-2{
  margin-top: 0.5rem;
}
.ml-2{
  margin-left: 0.5rem;
}
.ml-6{
  margin-left: 1.5rem;
}
.mt-1{
  margin-top: 0.25rem;
}
.mr-10{
  margin-right: 2.5rem;
}
.mr-1{
  margin-right: 0.25rem;
}
.-ml-1{
  margin-left: -0.25rem;
}
.-mt-1{
  margin-top: -0.25rem;
}
.mr-4{
  margin-right: 1rem;
}
.-mb-5{
  margin-bottom: -1.25rem;
}
.mt-7{
  margin-top: 1.75rem;
}
.mr-5{
  margin-right: 1.25rem;
}
.mr-24{
  margin-right: 6rem;
}
.ml-1{
  margin-left: 0.25rem;
}
.-ml-2{
  margin-left: -0.5rem;
}
.mt-12{
  margin-top: 3rem;
}
.-ml-4{
  margin-left: -1rem;
}
.mt-3{
  margin-top: 0.75rem;
}
.mb-7{
  margin-bottom: 1.75rem;
}
.-mt-px{
  margin-top: -1px;
}
.-ml-7{
  margin-left: -1.75rem;
}
.mb-32{
  margin-bottom: 8rem;
}
.ml-8{
  margin-left: 2rem;
}
.mr-2\.5{
  margin-right: 0.625rem;
}
.\!mr-0{
  margin-right: 0px !important;
}
.ml-1\.5{
  margin-left: 0.375rem;
}
.mb-\[1px\]{
  margin-bottom: 1px;
}
.mr-\[1px\]{
  margin-right: 1px;
}
.\!mt-4{
  margin-top: 1rem !important;
}
.block{
  display: block;
}
.inline-block{
  display: inline-block;
}
.inline{
  display: inline;
}
.flex{
  display: flex;
}
.inline-flex{
  display: inline-flex;
}
.table{
  display: table;
}
.grid{
  display: grid;
}
.contents{
  display: contents;
}
.hidden{
  display: none;
}
.h-10{
  height: 2.5rem;
}
.h-16{
  height: 4rem;
}
.h-40{
  height: 10rem;
}
.h-12{
  height: 3rem;
}
.h-9{
  height: 2.25rem;
}
.h-80{
  height: 20rem;
}
.h-full{
  height: 100%;
}
.h-36{
  height: 9rem;
}
.h-6{
  height: 1.5rem;
}
.h-auto{
  height: auto;
}
.h-0{
  height: 0px;
}
.h-px{
  height: 1px;
}
.h-5{
  height: 1.25rem;
}
.h-\[62px\]{
  height: 62px;
}
.max-h-9{
  max-height: 2.25rem;
}
.w-2\/4{
  width: 50%;
}
.w-\[34rem\]{
  width: 34rem;
}
.w-60{
  width: 15rem;
}
.w-1\/3{
  width: 33.333333%;
}
.w-32{
  width: 8rem;
}
.w-1\/6{
  width: 16.666667%;
}
.w-3\/4{
  width: 75%;
}
.w-72{
  width: 18rem;
}
.w-auto{
  width: auto;
}
.w-full{
  width: 100%;
}
.w-1\/12{
  width: 8.333333%;
}
.w-36{
  width: 9rem;
}
.w-2{
  width: 0.5rem;
}
.w-40{
  width: 10rem;
}
.w-9{
  width: 2.25rem;
}
.w-80{
  width: 20rem;
}
.w-6{
  width: 1.5rem;
}
.w-8{
  width: 2rem;
}
.w-12{
  width: 3rem;
}
.w-52{
  width: 13rem;
}
.w-5{
  width: 1.25rem;
}
.w-px{
  width: 1px;
}
.w-3\/5{
  width: 60%;
}
.w-5\/12{
  width: 41.666667%;
}
.w-11\/12{
  width: 91.666667%;
}
.w-1\/4{
  width: 25%;
}
.\!w-7{
  width: 1.75rem !important;
}
.w-1\/2{
  width: 50%;
}
.min-w-full{
  min-width: 100%;
}
.min-w-\[14rem\]{
  min-width: 14rem;
}
.min-w-\[24px\]{
  min-width: 24px;
}
.max-w-2xl{
  max-width: 42rem;
}
.max-w-lg{
  max-width: 32rem;
}
.max-w-4xl{
  max-width: 56rem;
}
.max-w-\[50rem\]{
  max-width: 50rem;
}
.max-w-\[40rem\]{
  max-width: 40rem;
}
.max-w-\[200px\]{
  max-width: 200px;
}
.max-w-\[800px\]{
  max-width: 800px;
}
.flex-auto{
  flex: 1 1 auto;
}
.flex-none{
  flex: none;
}
.flex-1{
  flex: 1 1 0%;
}
.shrink-0{
  flex-shrink: 0;
}
.grow{
  flex-grow: 1;
}
.basis-2\/3{
  flex-basis: 66.666667%;
}
.basis-1\/3{
  flex-basis: 33.333333%;
}
.basis-2{
  flex-basis: 0.5rem;
}
.basis-1{
  flex-basis: 0.25rem;
}
.basis-auto{
  flex-basis: auto;
}
.basis-\[460px\]{
  flex-basis: 460px;
}
.table-auto{
  table-layout: auto;
}
.table-fixed{
  table-layout: fixed;
}
.-translate-x-1{
  --tw-translate-x: -0.25rem;
  -webkit-transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
          transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}
.scale-125{
  --tw-scale-x: 1.25;
  --tw-scale-y: 1.25;
  -webkit-transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
          transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}
.transform{
  -webkit-transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
          transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}
@-webkit-keyframes spin{
  to{
    -webkit-transform: rotate(360deg);
            transform: rotate(360deg);
  }
}
@keyframes spin{
  to{
    -webkit-transform: rotate(360deg);
            transform: rotate(360deg);
  }
}
.animate-spin{
  -webkit-animation: spin 1s linear infinite;
          animation: spin 1s linear infinite;
}
.cursor-pointer{
  cursor: pointer;
}
.cursor-not-allowed{
  cursor: not-allowed;
}
.resize{
  resize: both;
}
.list-none{
  list-style-type: none;
}
.grid-cols-2{
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
.flex-row{
  flex-direction: row;
}
.flex-col{
  flex-direction: column;
}
.flex-wrap{
  flex-wrap: wrap;
}
.items-center{
  align-items: center;
}
.items-baseline{
  align-items: baseline;
}
.justify-end{
  justify-content: flex-end;
}
.justify-center{
  justify-content: center;
}
.justify-between{
  justify-content: space-between;
}
.gap-8{
  gap: 2rem;
}
.gap-2{
  gap: 0.5rem;
}
.gap-4{
  gap: 1rem;
}
.gap-px{
  gap: 1px;
}
.gap-x-4{
  -webkit-column-gap: 1rem;
          column-gap: 1rem;
}
.space-y-4 > :not([hidden]) ~ :not([hidden]){
  --tw-space-y-reverse: 0;
  margin-top: calc(1rem * calc(1 - var(--tw-space-y-reverse)));
  margin-bottom: calc(1rem * var(--tw-space-y-reverse));
}
.divide-x-2 > :not([hidden]) ~ :not([hidden]){
  --tw-divide-x-reverse: 0;
  border-right-width: calc(2px * var(--tw-divide-x-reverse));
  border-left-width: calc(2px * calc(1 - var(--tw-divide-x-reverse)));
}
.divide-gray-600 > :not([hidden]) ~ :not([hidden]){
  --tw-divide-opacity: 1;
  border-color: rgb(113 128 150 / var(--tw-divide-opacity));
}
.self-center{
  align-self: center;
}
.justify-self-end{
  justify-self: end;
}
.overflow-hidden{
  overflow: hidden;
}
.overflow-scroll{
  overflow: scroll;
}
.overflow-x-auto{
  overflow-x: auto;
}
.truncate{
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.whitespace-nowrap{
  white-space: nowrap;
}
.rounded-lg{
  border-radius: 0.5rem;
}
.rounded-md{
  border-radius: 0.375rem;
}
.rounded{
  border-radius: 0.25rem;
}
.rounded-full{
  border-radius: 9999px;
}
.rounded-xl{
  border-radius: 0.75rem;
}
.rounded-sm{
  border-radius: 0.125rem;
}
.\!rounded-full{
  border-radius: 9999px !important;
}
.rounded-t{
  border-top-left-radius: 0.25rem;
  border-top-right-radius: 0.25rem;
}
.rounded-r{
  border-top-right-radius: 0.25rem;
  border-bottom-right-radius: 0.25rem;
}
.border-2{
  border-width: 2px;
}
.border-4{
  border-width: 4px;
}
.border{
  border-width: 1px;
}
.\!border-1{
  border-width: 1px !important;
}
.border-1{
  border-width: 1px;
}
.border-0{
  border-width: 0;
}
.border-3{
  border-width: 3px;
}
.\!border-1\.5{
  border-width: 1.5px !important;
}
.border-1\.5{
  border-width: 1.5px;
}
.border-b-1{
  border-bottom-width: 1px;
}
.border-b-2{
  border-bottom-width: 2px;
}
.border-t-4{
  border-top-width: 4px;
}
.border-b-0{
  border-bottom-width: 0;
}
.border-t-1{
  border-top-width: 1px;
}
.border-b-4{
  border-bottom-width: 4px;
}
.border-l-2{
  border-left-width: 2px;
}
.border-b-3{
  border-bottom-width: 3px;
}
.border-b{
  border-bottom-width: 1px;
}
.border-r{
  border-right-width: 1px;
}
.border-t{
  border-top-width: 1px;
}
.border-t-2{
  border-top-width: 2px;
}
.border-b-1\.5{
  border-bottom-width: 1.5px;
}
.border-solid{
  border-style: solid;
}
.border-dashed{
  border-style: dashed;
}
.border-dotted{
  border-style: dotted;
}
.border-none{
  border-style: none;
}
.\!border-none{
  border-style: none !important;
}
.border-gray-400{
  --tw-border-opacity: 1;
  border-color: rgb(156 163 175 / var(--tw-border-opacity));
}
.border-black-default{
  --tw-border-opacity: 1;
  border-color: rgb(0 0 0 / var(--tw-border-opacity));
}
.border-red-default{
  --tw-border-opacity: 1;
  border-color: rgb(177 14 30 / var(--tw-border-opacity));
}
.border-green-default{
  --tw-border-opacity: 1;
  border-color: rgb(0 112 60 / var(--tw-border-opacity));
}
.border-blue-focus{
  --tw-border-opacity: 1;
  border-color: rgb(48 63 195 / var(--tw-border-opacity));
}
.border-blue-dark{
  --tw-border-opacity: 1;
  border-color: rgb(40 65 98 / var(--tw-border-opacity));
}
.border-white-default{
  --tw-border-opacity: 1;
  border-color: rgb(255 255 255 / var(--tw-border-opacity));
}
.border-black{
  --tw-border-opacity: 1;
  border-color: rgb(0 0 0 / var(--tw-border-opacity));
}
.border-gray-300{
  --tw-border-opacity: 1;
  border-color: rgb(209 213 219 / var(--tw-border-opacity));
}
.border-purple-200{
  --tw-border-opacity: 1;
  border-color: rgb(221 214 254 / var(--tw-border-opacity));
}
.border-violet-400{
  --tw-border-opacity: 1;
  border-color: rgb(167 139 250 / var(--tw-border-opacity));
}
.border-gray-200{
  --tw-border-opacity: 1;
  border-color: rgb(229 231 235 / var(--tw-border-opacity));
}
.border-black\/50{
  border-color: rgb(0 0 0 / 0.5);
}
.bg-blue-dark{
  --tw-bg-opacity: 1;
  background-color: rgb(40 65 98 / var(--tw-bg-opacity));
}
.bg-white-default{
  --tw-bg-opacity: 1;
  background-color: rgb(255 255 255 / var(--tw-bg-opacity));
}
.bg-green-100{
  --tw-bg-opacity: 1;
  background-color: rgb(209 250 229 / var(--tw-bg-opacity));
}
.bg-red-100{
  --tw-bg-opacity: 1;
  background-color: rgb(243 233 232 / var(--tw-bg-opacity));
}
.bg-blue-800{
  --tw-bg-opacity: 1;
  background-color: rgb(38 55 74 / var(--tw-bg-opacity));
}
.bg-transparent{
  background-color: transparent;
}
.bg-gray-100{
  --tw-bg-opacity: 1;
  background-color: rgb(243 244 246 / var(--tw-bg-opacity));
}
.bg-purple-200{
  --tw-bg-opacity: 1;
  background-color: rgb(221 214 254 / var(--tw-bg-opacity));
}
.bg-slate-200{
  --tw-bg-opacity: 1;
  background-color: rgb(226 232 240 / var(--tw-bg-opacity));
}
.bg-yellow-100{
  --tw-bg-opacity: 1;
  background-color: rgb(254 243 199 / var(--tw-bg-opacity));
}
.bg-green-50{
  --tw-bg-opacity: 1;
  background-color: rgb(236 253 245 / var(--tw-bg-opacity));
}
.bg-gray-background{
  --tw-bg-opacity: 1;
  background-color: rgb(244 244 244 / var(--tw-bg-opacity));
}
.bg-amber-100{
  --tw-bg-opacity: 1;
  background-color: rgb(254 243 199 / var(--tw-bg-opacity));
}
.bg-green-500{
  --tw-bg-opacity: 1;
  background-color: rgb(16 185 129 / var(--tw-bg-opacity));
}
.bg-yellow-300{
  --tw-bg-opacity: 1;
  background-color: rgb(252 211 77 / var(--tw-bg-opacity));
}
.bg-gray-200{
  --tw-bg-opacity: 1;
  background-color: rgb(229 231 235 / var(--tw-bg-opacity));
}
.bg-white{
  --tw-bg-opacity: 1;
  background-color: rgb(255 255 255 / var(--tw-bg-opacity));
}
.bg-red-default{
  --tw-bg-opacity: 1;
  background-color: rgb(177 14 30 / var(--tw-bg-opacity));
}
.bg-gray-selected{
  --tw-bg-opacity: 1;
  background-color: rgb(225 228 231 / var(--tw-bg-opacity));
}
.bg-green-light{
  --tw-bg-opacity: 1;
  background-color: rgb(236 243 236 / var(--tw-bg-opacity));
}
.bg-purple-100{
  --tw-bg-opacity: 1;
  background-color: rgb(237 233 254 / var(--tw-bg-opacity));
}
.bg-violet-300{
  --tw-bg-opacity: 1;
  background-color: rgb(196 181 253 / var(--tw-bg-opacity));
}
.bg-fuchsia-300{
  --tw-bg-opacity: 1;
  background-color: rgb(240 171 252 / var(--tw-bg-opacity));
}
.bg-gray-900{
  --tw-bg-opacity: 1;
  background-color: rgb(17 24 39 / var(--tw-bg-opacity));
}
.bg-gray-800{
  --tw-bg-opacity: 1;
  background-color: rgb(45 55 72 / var(--tw-bg-opacity));
}
.bg-gray-default{
  --tw-bg-opacity: 1;
  background-color: rgb(238 238 238 / var(--tw-bg-opacity));
}
.\!bg-transparent{
  background-color: transparent !important;
}
.\!bg-white{
  --tw-bg-opacity: 1 !important;
  background-color: rgb(255 255 255 / var(--tw-bg-opacity)) !important;
}
.fill-red-700{
  fill: #b91c1c;
}
.fill-violet-300{
  fill: #c4b5fd;
}
.fill-fuchsia-300{
  fill: #f0abfc;
}
.fill-green-700{
  fill: #047857;
}
.p-10{
  padding: 2.5rem;
}
.p-2{
  padding: 0.5rem;
}
.p-4{
  padding: 1rem;
}
.p-0{
  padding: 0px;
}
.p-5{
  padding: 1.25rem;
}
.p-7{
  padding: 1.75rem;
}
.p-6{
  padding: 1.5rem;
}
.p-1{
  padding: 0.25rem;
}
.p-3{
  padding: 0.75rem;
}
.\!p-1{
  padding: 0.25rem !important;
}
.\!p-0{
  padding: 0px !important;
}
.\!p-1\.5{
  padding: 0.375rem !important;
}
.py-4{
  padding-top: 1rem;
  padding-bottom: 1rem;
}
.px-8{
  padding-left: 2rem;
  padding-right: 2rem;
}
.\!py-2{
  padding-top: 0.5rem !important;
  padding-bottom: 0.5rem !important;
}
.px-2{
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}
.py-10{
  padding-top: 2.5rem;
  padding-bottom: 2.5rem;
}
.py-3{
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
}
.px-6{
  padding-left: 1.5rem;
  padding-right: 1.5rem;
}
.py-5{
  padding-top: 1.25rem;
  padding-bottom: 1.25rem;
}
.py-1{
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
}
.px-4{
  padding-left: 1rem;
  padding-right: 1rem;
}
.px-3{
  padding-left: 0.75rem;
  padding-right: 0.75rem;
}
.py-2{
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}
.px-32{
  padding-left: 8rem;
  padding-right: 8rem;
}
.px-5{
  padding-left: 1.25rem;
  padding-right: 1.25rem;
}
.px-10{
  padding-left: 2.5rem;
  padding-right: 2.5rem;
}
.px-1{
  padding-left: 0.25rem;
  padding-right: 0.25rem;
}
.\!py-5{
  padding-top: 1.25rem !important;
  padding-bottom: 1.25rem !important;
}
.\!px-4{
  padding-left: 1rem !important;
  padding-right: 1rem !important;
}
.px-2\.5{
  padding-left: 0.625rem;
  padding-right: 0.625rem;
}
.py-2\.5{
  padding-top: 0.625rem;
  padding-bottom: 0.625rem;
}
.px-1\.5{
  padding-left: 0.375rem;
  padding-right: 0.375rem;
}
.pb-8{
  padding-bottom: 2rem;
}
.pb-10{
  padding-bottom: 2.5rem;
}
.pl-0{
  padding-left: 0px;
}
.pl-4{
  padding-left: 1rem;
}
.\!pb-0{
  padding-bottom: 0px !important;
}
.\!pt-1{
  padding-top: 0.25rem !important;
}
.pt-2{
  padding-top: 0.5rem;
}
.\!pb-3{
  padding-bottom: 0.75rem !important;
}
.pr-8{
  padding-right: 2rem;
}
.pb-0{
  padding-bottom: 0px;
}
.pt-10{
  padding-top: 2.5rem;
}
.pb-5{
  padding-bottom: 1.25rem;
}
.pr-7{
  padding-right: 1.75rem;
}
.pb-1{
  padding-bottom: 0.25rem;
}
.pt-28{
  padding-top: 7rem;
}
.pl-6{
  padding-left: 1.5rem;
}
.pr-5{
  padding-right: 1.25rem;
}
.pl-3{
  padding-left: 0.75rem;
}
.pt-5{
  padding-top: 1.25rem;
}
.pl-5{
  padding-left: 1.25rem;
}
.pl-1{
  padding-left: 0.25rem;
}
.pr-2{
  padding-right: 0.5rem;
}
.pr-1{
  padding-right: 0.25rem;
}
.pt-8{
  padding-top: 2rem;
}
.pb-3{
  padding-bottom: 0.75rem;
}
.pl-2{
  padding-left: 0.5rem;
}
.pl-8{
  padding-left: 2rem;
}
.pb-2{
  padding-bottom: 0.5rem;
}
.pr-4{
  padding-right: 1rem;
}
.pt-4{
  padding-top: 1rem;
}
.\!pb-0\.5{
  padding-bottom: 0.125rem !important;
}
.\!pt-1\.5{
  padding-top: 0.375rem !important;
}
.\!pl-4{
  padding-left: 1rem !important;
}
.\!pr-2{
  padding-right: 0.5rem !important;
}
.pt-2\.5{
  padding-top: 0.625rem;
}
.pb-1\.5{
  padding-bottom: 0.375rem;
}
.pl-0\.5{
  padding-left: 0.125rem;
}
.text-left{
  text-align: left;
}
.text-center{
  text-align: center;
}
.font-mono{
  font-family: monospace;
}
.font-sans{
  font-family: Lato, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
}
.\!font-sans{
  font-family: Lato, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji" !important;
}
.text-sm{
  font-size: 16px;
  line-height: 22px;
}
.text-p{
  font-size: 20px;
  line-height: 28px;
}
.text-\[1\.6rem\]{
  font-size: 1.6rem;
}
.text-h1{
  font-size: 34px;
  line-height: 44px;
}
.text-base{
  font-size: 20px;
  line-height: 28px;
}
.text-h3{
  font-size: 26px;
  line-height: 32px;
}
.text-h2{
  font-size: 30px;
  line-height: 38px;
}
.text-\[1\.3rem\]{
  font-size: 1.3rem;
}
.text-\[2rem\]{
  font-size: 2rem;
}
.text-\[\.7rem\]{
  font-size: .7rem;
}
.text-\[1rem\]{
  font-size: 1rem;
}
.\!text-h2{
  font-size: 30px !important;
  line-height: 38px !important;
}
.\!text-sm{
  font-size: 16px !important;
  line-height: 22px !important;
}
.text-\[24px\]{
  font-size: 24px;
}
.font-bold{
  font-weight: 700;
}
.font-normal{
  font-weight: 400;
}
.font-\[700\]{
  font-weight: 700;
}
.capitalize{
  text-transform: capitalize;
}
.italic{
  font-style: italic;
}
.not-italic{
  font-style: normal;
}
.leading-snug{
  line-height: 1.375;
}
.leading-6{
  line-height: 1.5rem;
}
.leading-\[24px\]{
  line-height: 24px;
}
.tracking-tighter{
  letter-spacing: -0.05em;
}
.text-white-default{
  --tw-text-opacity: 1;
  color: rgb(255 255 255 / var(--tw-text-opacity));
}
.text-black-default{
  --tw-text-opacity: 1;
  color: rgb(0 0 0 / var(--tw-text-opacity));
}
.text-blue-dark{
  --tw-text-opacity: 1;
  color: rgb(40 65 98 / var(--tw-text-opacity));
}
.text-red-destructive{
  --tw-text-opacity: 1;
  color: rgb(137 36 6 / var(--tw-text-opacity));
}
.text-red-default{
  --tw-text-opacity: 1;
  color: rgb(177 14 30 / var(--tw-text-opacity));
}
.text-green-default{
  --tw-text-opacity: 1;
  color: rgb(0 112 60 / var(--tw-text-opacity));
}
.text-green-darker{
  --tw-text-opacity: 1;
  color: rgb(0 89 48 / var(--tw-text-opacity));
}
.text-red-500{
  --tw-text-opacity: 1;
  color: rgb(239 68 68 / var(--tw-text-opacity));
}
.text-gray-600{
  --tw-text-opacity: 1;
  color: rgb(113 128 150 / var(--tw-text-opacity));
}
.text-white{
  --tw-text-opacity: 1;
  color: rgb(255 255 255 / var(--tw-text-opacity));
}
.text-\[color\:white\]{
  --tw-text-opacity: 1;
  color: rgb(255 255 255 / var(--tw-text-opacity));
}
.text-red{
  --tw-text-opacity: 1;
  color: rgb(177 14 30 / var(--tw-text-opacity));
}
.\!text-black{
  --tw-text-opacity: 1 !important;
  color: rgb(0 0 0 / var(--tw-text-opacity)) !important;
}
.underline{
  text-decoration-line: underline;
}
.no-underline{
  text-decoration-line: none;
}
.opacity-0{
  opacity: 0;
}
.shadow-lg{
  --tw-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --tw-shadow-colored: 0 10px 15px -3px var(--tw-shadow-color), 0 4px 6px -4px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}
.shadow-default{
  --tw-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);;
  --tw-shadow-colored: 0 1px 3px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}
.shadow-none{
  --tw-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
  --tw-shadow-colored: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}
.\!shadow-none{
  --tw-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow) !important;
  --tw-shadow-colored: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow) !important;
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow) !important;
}
.outline{
  outline-style: solid;
}
.outline-\[2px\]{
  outline-width: 2px;
}
.outline-blue-focus{
  outline-color: #303FC3;
}
.blur{
  --tw-blur: blur(8px);
  -webkit-filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);
          filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);
}
.filter{
  -webkit-filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);
          filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);
}
.transition-colors{
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}
.transition{
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, -webkit-transform, -webkit-filter, -webkit-backdrop-filter;
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter;
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter, -webkit-transform, -webkit-filter, -webkit-backdrop-filter;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}
.transition-opacity{
  transition-property: opacity;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}
.delay-500{
  transition-delay: 500ms;
}
.duration-100{
  transition-duration: 100ms;
}
.duration-1000{
  transition-duration: 1000ms;
}
.duration-\[1500ms\]{
  transition-duration: 1500ms;
}
.ease-out{
  transition-timing-function: cubic-bezier(0, 0, 0.2, 1);
}
.ease-in-out{
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
.line-clamp-3{
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}
.line-clamp-1{
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
}
.after\:absolute::after{
  content: var(--tw-content);
  position: absolute;
}
.after\:left-1\/2::after{
  content: var(--tw-content);
  left: 50%;
}
.after\:top-\[100\%\]::after{
  content: var(--tw-content);
  top: 100%;
}
.after\:-translate-x-1\/2::after{
  content: var(--tw-content);
  --tw-translate-x: -50%;
  -webkit-transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
          transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}
.after\:border-8::after{
  content: var(--tw-content);
  border-width: 8px;
}
.after\:border-x-transparent::after{
  content: var(--tw-content);
  border-left-color: transparent;
  border-right-color: transparent;
}
.after\:border-b-transparent::after{
  content: var(--tw-content);
  border-bottom-color: transparent;
}
.after\:border-t-gray-700::after{
  content: var(--tw-content);
  --tw-border-opacity: 1;
  border-top-color: rgb(74 85 104 / var(--tw-border-opacity));
}
.after\:content-\[\'\'\]::after{
  --tw-content: '';
  content: var(--tw-content);
}
.first\:pt-4:first-child{
  padding-top: 1rem;
}
.first\:pl-0:first-child{
  padding-left: 0px;
}
.last\:pb-4:last-child{
  padding-bottom: 1rem;
}
.first-of-type\:rounded-t-md:first-of-type{
  border-top-left-radius: 0.375rem;
  border-top-right-radius: 0.375rem;
}
.last-of-type\:rounded-b-md:last-of-type{
  border-bottom-right-radius: 0.375rem;
  border-bottom-left-radius: 0.375rem;
}
.visited\:text-black-default:visited{
  color: rgb(0 0 0 );
}
.visited\:text-white-default:visited{
  color: rgb(255 255 255 );
}
.hover\:cursor-pointer:hover{
  cursor: pointer;
}
.hover\:border-blue-hover:hover{
  --tw-border-opacity: 1;
  border-color: rgb(5 53 210 / var(--tw-border-opacity));
}
.hover\:border-red-destructive:hover{
  --tw-border-opacity: 1;
  border-color: rgb(137 36 6 / var(--tw-border-opacity));
}
.hover\:bg-blue-light:hover{
  --tw-bg-opacity: 1;
  background-color: rgb(51 80 117 / var(--tw-bg-opacity));
}
.hover\:bg-gray-selected:hover{
  --tw-bg-opacity: 1;
  background-color: rgb(225 228 231 / var(--tw-bg-opacity));
}
.hover\:\!bg-gray-600:hover{
  --tw-bg-opacity: 1 !important;
  background-color: rgb(113 128 150 / var(--tw-bg-opacity)) !important;
}
.hover\:bg-gray-600:hover{
  --tw-bg-opacity: 1;
  background-color: rgb(113 128 150 / var(--tw-bg-opacity));
}
.hover\:bg-red-destructive:hover{
  --tw-bg-opacity: 1;
  background-color: rgb(137 36 6 / var(--tw-bg-opacity));
}
.hover\:text-white-default:hover{
  --tw-text-opacity: 1;
  color: rgb(255 255 255 / var(--tw-text-opacity));
}
.hover\:text-blue-hover:hover{
  --tw-text-opacity: 1;
  color: rgb(5 53 210 / var(--tw-text-opacity));
}
.hover\:underline:hover{
  text-decoration-line: underline;
}
.hover\:no-underline:hover{
  text-decoration-line: none;
}
.focus\:cursor-pointer:focus{
  cursor: pointer;
}
.focus\:border-blue-hover:focus{
  --tw-border-opacity: 1;
  border-color: rgb(5 53 210 / var(--tw-border-opacity));
}
.focus\:border-blue-focus:focus{
  --tw-border-opacity: 1;
  border-color: rgb(48 63 195 / var(--tw-border-opacity));
}
.focus\:bg-blue-focus:focus{
  --tw-bg-opacity: 1;
  background-color: rgb(48 63 195 / var(--tw-bg-opacity));
}
.focus\:bg-white:focus{
  --tw-bg-opacity: 1;
  background-color: rgb(255 255 255 / var(--tw-bg-opacity));
}
.focus\:bg-blue-hover:focus{
  --tw-bg-opacity: 1;
  background-color: rgb(5 53 210 / var(--tw-bg-opacity));
}
.focus\:\!bg-blue-hover:focus{
  --tw-bg-opacity: 1 !important;
  background-color: rgb(5 53 210 / var(--tw-bg-opacity)) !important;
}
.focus\:bg-gray-default:focus{
  --tw-bg-opacity: 1;
  background-color: rgb(238 238 238 / var(--tw-bg-opacity));
}
.focus\:text-white-default:focus{
  --tw-text-opacity: 1;
  color: rgb(255 255 255 / var(--tw-text-opacity));
}
.focus\:\!text-white-default:focus{
  --tw-text-opacity: 1 !important;
  color: rgb(255 255 255 / var(--tw-text-opacity)) !important;
}
.focus\:shadow-none:focus{
  --tw-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
  --tw-shadow-colored: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}
.focus\:outline:focus{
  outline-style: solid;
}
.focus\:outline-\[3px\]:focus{
  outline-width: 3px;
}
.focus\:outline-2:focus{
  outline-width: 2px;
}
.focus\:outline-0:focus{
  outline-width: 0px;
}
.focus\:outline-offset-2:focus{
  outline-offset: 2px;
}
.focus\:outline-blue-focus:focus{
  outline-color: #303FC3;
}
.focus\:outline-red:focus{
  outline-color: #b10e1e;
}
.active\:top-0\.5:active{
  top: 0.125rem;
}
.active\:top-0:active{
  top: 0px;
}
.active\:bg-blue-active:active{
  --tw-bg-opacity: 1;
  background-color: rgb(27 39 54 / var(--tw-bg-opacity));
}
.active\:bg-blue-hover:active{
  --tw-bg-opacity: 1;
  background-color: rgb(5 53 210 / var(--tw-bg-opacity));
}
.active\:bg-gray-500:active{
  --tw-bg-opacity: 1;
  background-color: rgb(160 174 192 / var(--tw-bg-opacity));
}
.active\:bg-red-hover:active{
  --tw-bg-opacity: 1;
  background-color: rgb(78 21 4 / var(--tw-bg-opacity));
}
.active\:text-white-default:active{
  --tw-text-opacity: 1;
  color: rgb(255 255 255 / var(--tw-text-opacity));
}
.active\:underline:active{
  text-decoration-line: underline;
}
.active\:no-underline:active{
  text-decoration-line: none;
}
.active\:shadow-none:active{
  --tw-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
  --tw-shadow-colored: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}
.disabled\:cursor-not-allowed:disabled{
  cursor: not-allowed;
}
.disabled\:\!bg-transparent:disabled{
  background-color: transparent !important;
}
.disabled\:text-gray-500:disabled{
  --tw-text-opacity: 1;
  color: rgb(160 174 192 / var(--tw-text-opacity));
}
.group:hover .group-hover\:fill-blue-hover{
  fill: #0535D2;
}
.group:hover .group-hover\:underline{
  text-decoration-line: underline;
}
.group:focus .group-focus\:fill-white-default{
  fill: #FFF;
}
.group:focus .group-focus\:underline{
  text-decoration-line: underline;
}
.group:active .group-active\:fill-white-default{
  fill: #FFF;
}
.group:hover:enabled .group-hover\:group-enabled\:fill-white-default{
  fill: #FFF;
}
.group:disabled .group-disabled\:fill-gray-500{
  fill: #a0aec0;
}
.peer:hover ~ .peer-hover\:visible{
  visibility: visible;
}
.peer:focus ~ .peer-focus\:visible{
  visibility: visible;
}
.aria-expanded\:border-black-default[aria-expanded="true"]{
  --tw-border-opacity: 1;
  border-color: rgb(0 0 0 / var(--tw-border-opacity));
}
@media (max-width: 1200px){
  .xxl\:basis-\[10px\]{
    flex-basis: 10px;
  }
  .xxl\:flex-col-reverse{
    flex-direction: column-reverse;
  }
}
@media (max-width: 992px){
  .xl\:\!mx-8{
    margin-left: 2rem !important;
    margin-right: 2rem !important;
  }
  .xl\:mx-auto{
    margin-left: auto;
    margin-right: auto;
  }
  .xl\:mx-0{
    margin-left: 0px;
    margin-right: 0px;
  }
  .xl\:ml-40{
    margin-left: 10rem;
  }
  .xl\:mb-2{
    margin-bottom: 0.5rem;
  }
  .xl\:mr-2{
    margin-right: 0.5rem;
  }
  .xl\:block{
    display: block;
  }
  .xl\:w-36{
    width: 9rem;
  }
  .xl\:w-40{
    width: 10rem;
  }
  .xl\:content-center{
    align-content: center;
  }
  .xl\:px-8{
    padding-left: 2rem;
    padding-right: 2rem;
  }
  .xl\:pb-0{
    padding-bottom: 0px;
  }
  .xl\:pt-2{
    padding-top: 0.5rem;
  }
  .xl\:text-center{
    text-align: center;
  }
  .xl\:text-sm{
    font-size: 16px;
    line-height: 22px;
  }
}
@media (max-width: 768px){
  .lg\:\!mx-4{
    margin-left: 1rem !important;
    margin-right: 1rem !important;
  }
  .lg\:mt-10{
    margin-top: 2.5rem;
  }
  .lg\:mt-4{
    margin-top: 1rem;
  }
  .lg\:h-8{
    height: 2rem;
  }
  .lg\:flex-col{
    flex-direction: column;
  }
  .lg\:items-start{
    align-items: flex-start;
  }
  .lg\:gap-4{
    gap: 1rem;
  }
  .lg\:px-0{
    padding-left: 0px;
    padding-right: 0px;
  }
  .lg\:py-0{
    padding-top: 0px;
    padding-bottom: 0px;
  }
  .lg\:px-4{
    padding-left: 1rem;
    padding-right: 1rem;
  }
  .lg\:pr-0{
    padding-right: 0px;
  }
  .lg\:pb-4{
    padding-bottom: 1rem;
  }
  .lg\:\!pb-3{
    padding-bottom: 0.75rem !important;
  }
  .lg\:text-small_base{
    font-size: 16px;
    line-height: 22px;
  }
}
@media (max-width: 550px){
  .md\:mb-10{
    margin-bottom: 2.5rem;
  }
  .md\:pl-5{
    padding-left: 1.25rem;
  }
  .md\:pr-0{
    padding-right: 0px;
  }
  .md\:text-h1{
    font-size: 34px;
    line-height: 44px;
  }
  .md\:text-small_h1{
    font-size: 24px;
    line-height: 28px;
  }
  .md\:text-small_base{
    font-size: 16px;
    line-height: 22px;
  }
}
@media (max-width: 450px){
  .sm\:flex-col{
    flex-direction: column;
  }
}
`;

export default middleware([cors({ allowedMethods }), sessionExists()], handler);
