import React from "react";
import classnames from "classnames";

interface HeadingProps {
  headingLevel: string;
  children: React.ReactNode;
  isSectional?: boolean;
  id?: string;
  className?: string;
}

export const Heading = (props: HeadingProps): React.ReactElement => {
  const { headingLevel, children, className, id, isSectional } = props;

  const classes = classnames(`gc-${headingLevel}`, className, {
    "gc-section-header": isSectional,
  });

  const CustomTag = headingLevel as keyof JSX.IntrinsicElements;

  return (
    <CustomTag data-testid="heading" className={classes} id={id}>
      {children}
    </CustomTag>
  );
};

export default Heading;
