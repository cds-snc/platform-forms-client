import React from "react";
import styled from "styled-components";

const StyledDiv = styled.div`
  font-size: 1rem;
`;

const StyledUl = styled.ul`
  margin-top: 10px;
  margin-bottom: 20px;
`;

export const ConfirmationDescription = () => {
  return (
    <StyledDiv>
      <p>
        The confirmation message will appear on a new page once the form has been submitted.{" "}
        <a href="http://canada.ca">Find out more about what should be included</a>. Some useful
        things you can add to your confirmation page are:
      </p>
      <StyledUl>
        <li>details of what happens next and when</li>
        <li>contact details for the service</li>
        <li>links to information or services that users are likely to need next</li>
        <li>
          a link to your feedback form. (if you don’t have one, you can set one up using GC Forms to
          be launched along with your main form)
        </li>
      </StyledUl>
    </StyledDiv>
  );
};
