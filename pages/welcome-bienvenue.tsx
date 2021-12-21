/* eslint-disable @next/next/no-img-element */
import React from "react";

import { useTranslation } from "next-i18next";
import Image from "next/image";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import { GetStaticProps } from "next";

const Home = () => {
  const { t } = useTranslation("welcome");

  return (
    <div>
      <h1 className="sr-only">{t("title")}</h1>
      <div className="gc-welcome-bg-container bg-blue-800">
        <div className="gc-welcome-container">
          <div className="welcome-grid">
            <div className="welcome-grid-item text-white-default align-middle">
              <h2>Create forms for your department</h2>
              <p>Try forms if you work in the federal government</p>
            </div>
            <div className="welcome-grid-item self-center">
              <img alt="Works on multiple device types" src="/img/phone_and_mac.png" />
            </div>
          </div>
        </div>
      </div>
      <div className="gc-welcome-bg-container">
        <div className="gc-welcome-container">
          <div className="welcome-grid">
            <div className="welcome-grid-item self-center">
              <img alt="Custom forms" src="/img/custom_form.png" />
            </div>
            <div className="welcome-grid-item">
              <h2>Forms for Government</h2>
              <p>
                <b>
                  <i>Forms</i>
                </b>{" "}
                is built for the Government of Canada
              </p>
              <p>
                Create forms based on the needs of your department. Use our fields to keep your
                forms easy, consistent, and accessible.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="gc-welcome-bg-container bg-gray-background">
        <div className="gc-welcome-container">
          <div className="welcome-grid">
            <div className="welcome-grid-item">
              <h2>Forms is built for you</h2>
              <ul>
                <li>
                  Administrators who have to meet departmental service standards for communication
                </li>
                <li>
                  Staff wrestling with multiple systems to process applications, requests, and
                  payments
                </li>
                <li>Developers working on improving workflow and tooling for public servants</li>
              </ul>
            </div>
            <div className="welcome-grid-item self-center">
              <img alt="built for you" src="/img/built_for_you.png" />
            </div>
          </div>
        </div>
      </div>
      <div className="gc-welcome-bg-container">
        <div className="gc-welcome-container">
          <div className="welcome-grid">
            <div className="welcome-grid-item self-center">
              <img alt="Pricing" src="/img/pricing.png" />
            </div>
            <div className="welcome-grid-item">
              <h2>Forms is free for GC services</h2>
              <p>Use Forms for free and replace paper and PDF systems</p>
              <ul>
                <li>Create unlimited forms, completely free</li>
                <li>The Forms service is provided and managed by CDS - no external procurement</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div className="gc-welcome-bg-container bg-gray-background">
        <div className="gc-welcome-container py-10">
          <h2 className="text-center">These teams are already using Forms</h2>
          <div className="welcome-grid mt-10">
            <div>
              <p>
                I absolutely love this Forms services. It saved me and my team a lot of time when
                trying to publish a form
              </p>
            </div>
            <div>
              <p>I&apos;m a loro ipsum type thingy.............</p>
            </div>
            <div>
              <p>I&apos;m a loro ipsum type thingy.............</p>
            </div>
            <div>
              <p>
                I absolutely love this Forms services. It saved me and my team a lot of time when
                trying to publish a form
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale = "en" }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "welcome"])),
    },
  };
};

export default Home;
