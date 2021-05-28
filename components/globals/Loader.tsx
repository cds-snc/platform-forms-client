import React from "react";
import { css } from "@emotion/react";
import Loader from "react-spinners/PropagateLoader";

interface CustomLoaderProps {
  loading: boolean;
  message: string;
}

const override = css`
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const CustomLoader = ({ loading, message }: CustomLoaderProps): React.ReactElement => {
  return (
    <div role="status" className="text-center">
      <p className="pb-8">{message}</p>
      <Loader loading={loading} color="#00703C" size="25px" css={override} />
    </div>
  );
};

export default CustomLoader;
