import React from "react";
import { RichText } from "./RichText";

export default {
  title: "Forms/RichText",
  component: RichText,
  parameters: {
    info: `RichText component`,
  },
};

const richText = ` <h1>Rich Text</h1>

The Canadian Digital Service teams up with federal departments and agencies to put people’s needs at the centre of government services.

<h2>Working together</h2>
Our aim is to make services easier for government to deliver. We collaborate with people who work in government to address service delivery problems. We test with people who need government services to find design solutions that are easy to use.`;
export const defaultRichText = (): React.ReactElement => <RichText>{richText}</RichText>;
