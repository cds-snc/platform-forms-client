import React, { ReactElement, useState, useEffect } from "react";
import { Template, serverSideProps, PageProps } from "./[[...params]]";
import { NextPageWithLayout } from "../_app";
import { useRouter } from "next/router";

const Page: NextPageWithLayout<PageProps> = () => {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    router.replace(router.pathname, router.pathname, { shallow: true });
    setReady(true);
  }, []);

  return ready ? <div>hello</div> : null;
};

Page.getLayout = (page: ReactElement) => {
  return <Template page={page} />;
};

export const getServerSideProps = serverSideProps;
