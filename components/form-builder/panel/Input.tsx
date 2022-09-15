import styled from "styled-components";

export const Input = styled.input`
  padding: 22px 10px;
  width: 460px;
  border: 1.5px solid #000000;
  border-radius: 4px;
  max-height: 36px;

  &:focus {
    border-color: #303fc3;
    box-shadow: 0 0 0 2.5px #303fc3;
    outline: 0;
  }
`;
