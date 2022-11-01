import React from "react";
import styled from "styled-components";

const StyledDiv = styled.div`
  font-size: 1rem;
  margin-bottom: 20px;
`;

export const PrivacyDescription = () => {
  return (
    <StyledDiv>
      <p>
        You are responsible for drafting privacy notices that follow the requirements of the{" "}
        <a href="https://www.tbs-sct.canada.ca/pol/doc-eng.aspx?id=18309">
          Directive on Privacy Practices
        </a>
      </p>
    </StyledDiv>
  );
};
