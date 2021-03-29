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
  const classes = classnames(
    "gc-confirmation-banner bg-gray-200 py-16 px-20 mb-10 w-5/6 xl:w-full md:py-10 md:px-10",
    className
  );

  return (
    <div className={classes} {...props} >
      <h2 className="text-h2 mb-6 md:text-small_h2">{title}</h2>
      <p className="mb-5 md:text-small_p">{lightText}</p>
      <p className="font-bold md:text-small_p">{boldText}</p>
    </div>
  );
};

export default ConfirmationBanner;