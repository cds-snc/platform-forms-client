import styled from "styled-components";

export const Container = styled.div`
  margin: 2rem auto;
  max-width: 72rem; //80chars
  min-width: 54rem; //60chars
  display: flex;
  flex-direction: column;
  border: 1px solid #000;
`;

export const EditorStyles = styled.div`
  border: 1px solid #000;

  h2 {
    color: green;
  }
`;
