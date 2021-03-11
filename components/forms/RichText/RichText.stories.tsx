import React from "react";
import { RichText } from "./RichText";

export default {
  title: "Forms/RichText",
  component: RichText,
  parameters: {
    info: `RichText component converts markdown into JSX`,
  },
};

const richText = `# Rich Text

The Canadian Digital Service teams up with federal departments and agencies to put people’s needs at the centre of government services.

## Working together
Our aim is to make services easier for government to deliver. We collaborate with people who work in government to address service delivery problems. We test with people who need government services to find design solutions that are easy to use.

[Learn more](https://digital.canada.ca/partnerships)
`;
export const defaultRichText = (): React.ReactElement => <RichText>{richText}</RichText>;
