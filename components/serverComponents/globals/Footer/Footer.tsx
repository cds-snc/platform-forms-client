import { cn } from "@lib/utils";

import { Version } from "@clientComponents/globals/Version";
import { FormBuilderLinks, DefaultLinks } from "./Links";
import { Nav } from "./Nav";
import { GCGranding } from "./GCBranding";
interface FooterProps {
  isSplashPage?: boolean;
  disableGcBranding?: boolean;
  displayFormBuilderFooter?: boolean;
  className?: string;
}

export const Footer = async ({
  isSplashPage = false,
  disableGcBranding,
  displayFormBuilderFooter = false,
  className = "",
}: FooterProps) => {
  const isFormBuilder = displayFormBuilderFooter ? true : false;

  const versionNumber = <Version isFormBuilder={isFormBuilder ? true : false} />;

  return (
    <footer
      className={cn(
        "tablet:px-[4rem] laptop:px-32 mt-16 flex-none border-0 bg-gray-100 px-[1rem] py-0 lg:mt-10",
        className
      )}
      data-server="true"
      data-testid="footer"
    >
      <div className="flex flex-row items-center justify-between pt-10 pb-5 lg:flex-col lg:items-start lg:gap-4">
        <div>
          {!isFormBuilder && versionNumber}

          {!isSplashPage && (
            <Nav isFormBuilder={isFormBuilder}>
              {displayFormBuilderFooter ? <FormBuilderLinks /> : <DefaultLinks />}
            </Nav>
          )}

          {isFormBuilder && versionNumber}
        </div>
        {!disableGcBranding && <GCGranding />}
      </div>
    </footer>
  );
};
