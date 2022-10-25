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
        This privacy statement will appear on your form above the submit button.{" "}
        <a href="http://canada.ca">Find out more about what should be included.</a>
      </p>
    </StyledDiv>
  );
};
