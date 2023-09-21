import React, { ReactElement } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetStaticProps } from "next";
import { NextPageWithLayout } from "@pages/_app";
import { FullWidthLayout } from "@components/globals/layouts";

const Heading = ({ title }: { title: string }) => {
  return (
    <h2 className="my-4 border-y-1 border-slate-700 bg-slate-50 py-4 text-center text-2xl font-bold">
      {title}
    </h2>
  );
};

const Typography: NextPageWithLayout = () => {
  return (
    <>
      <Heading title="Public forms + pages" />
      <div className="gc-formview">
        <p className="mb-4">Default (base) text size (20px)</p>

        <h1>H1 Heading</h1>
        <h2>H2 Heading</h2>
        <h3>H3 Heading</h3>
        <h4>H4 Heading</h4>
        <h5>H5 Heading</h5>
      </div>

      <Heading title="Form builder + Admin" />
      <p className="mb-4">Default (base) text size (18px)</p>

      <h1>H1 Heading</h1>
      <h2>H2 Heading</h2>
      <h3>H3 Heading</h3>
      <h4>H4 Heading</h4>
      <h5>H5 Heading</h5>

      <Heading title="Text sizes" />
      <p className="text-xs">text-xs</p>
      <p className="text-sm">text-sm</p>
      <p className="text-base">text-base</p>
      <p className="text-lg">text-lg</p>
      <p className="text-xl">text-xl</p>
      <p className="text-2xl">text-2xl</p>
      <p className="text-3xl">text-3xl</p>
      <p className="text-4xl">text-4xl</p>
      <p className="text-5xl">text-5xl</p>
      <p className="text-6xl">text-6xl</p>
      <p className="text-7xl">text-7xl</p>
      <p className="text-8xl">text-8xl</p>
      <p className="text-9xl">text-9xl</p>

      <Heading title="Font weights" />
      <p className="font-thin">font-thin</p>
      <p className="font-extralight">font-extralight</p>
      <p className="font-light">font-light</p>
      <p className="font-normal">font-normal</p>
      <p className="font-medium">font-medium</p>
      <p className="font-semibold">font-semibold</p>
      <p className="font-bold">font-bold</p>
      <p className="font-extrabold">font-extrabold</p>
      <p className="font-black">font-black</p>

      <Heading title="Lists" />
      <p>Unordered list</p>
      <ul>
        <li>List item</li>
        <li>List item</li>
      </ul>

      <p>Ordered list</p>
      <ol>
        <li>List item</li>
        <li>List item</li>
      </ol>
      <hr />
    </>
  );
};

Typography.getLayout = (page: ReactElement) => {
  return <FullWidthLayout context="default">{page}</FullWidthLayout>;
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(locale && (await serverSideTranslations(locale, ["common", "sla"]))),
    },
  };
};

export default Typography;
