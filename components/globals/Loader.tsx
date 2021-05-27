import React from "react";
import { css } from "@emotion/react";
import Loader from "react-spinners/PacmanLoader";

interface CustomLoaderProps {
  loading: boolean;
  message: string;
}

const override = css`
  display: block;
`;

export const CustomLoader = ({ loading, message }: CustomLoaderProps): React.ReactElement => {
  return (
    <div role="status">
      <p className="pb-6">{message}</p>
      <Loader loading={loading} color="#00703C" size="100px" margin="2px" css={override} />
    </div>
  );
};

export default CustomLoader;
