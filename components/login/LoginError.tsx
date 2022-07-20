import React from "react";

interface LoginErrorProps {
  label?: string | undefined;
  message?: string | undefined;
}

const LoginError = (props: LoginErrorProps): React.ReactElement => {
  return (
    <p role="alert" data-testid="alert">
      {props.label}
      <br />
      {props.message}
    </p>
  );
};

export default LoginError;
