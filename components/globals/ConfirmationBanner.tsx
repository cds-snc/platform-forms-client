import React from "react";
import classnames from "classnames";

interface ConfirmationBannerProps {
  title: String;
  lightText: String;
  boldText: String;
}

export const ConfirmationBanner = ({
  title,
  lightText,
  boldText,
  className,
  ...props
}: ConfirmationBannerProps & React.HTMLAttributes<HTMLDivElement>): React.ReactElement => {
  const classes = classnames("gc-confirmation-banner", className);

  return (
    <div className={classes} {...props}>
      <h2>{title}</h2>
      <p>{lightText}</p>
      <p>{boldText}</p>
    </div>
  );
};

export default ConfirmationBanner;
