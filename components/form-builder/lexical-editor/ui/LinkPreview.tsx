/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import * as React from "react";
import { CSSProperties, Suspense } from "react";
import styled from "styled-components";
import Image from "next/image";

const LinkPreviewContainer = styled.div`
  @keyframes glimmer-animation {
    0% {
      background: #f9f9f9;
    }
    .50% {
      background: #eeeeee;
    }
    .100% {
      background: #f9f9f9;
    }
  }

  .LinkPreview__container {
    padding-bottom: 12px;
  }

  .LinkPreview__imageWrapper {
    text-align: center;
  }

  .LinkPreview__image {
    max-width: 100%;
    max-height: 250px;
    margin: auto;
  }

  .LinkPreview__title {
    margin-left: 12px;
    margin-right: 12px;
    margin-top: 4px;
  }

  .LinkPreview__description {
    color: #999;
    font-size: 90%;
    margin-left: 12px;
    margin-right: 12px;
    margin-top: 4px;
  }

  .LinkPreview__domain {
    color: #999;
    font-size: 90%;
    margin-left: 12px;
    margin-right: 12px;
    margin-top: 4px;
  }

  .LinkPreview__glimmer {
    background: #f9f9f9;
    border-radius: 8px;
    height: 18px;
    margin-bottom: 8px;
    margin-left: 12px;
    margin-right: 12px;
    animation-duration: 3s;
    animation-iteration-count: infinite;
    animation-timing-function: linear;
    animation-name: glimmer-animation;
  }
`;

type Preview = {
  title: string;
  description: string;
  img: string;
  domain: string;
} | null;

// Cached responses or running request promises
const PREVIEW_CACHE: Record<string, Promise<Preview> | { preview: Preview }> = {};

const URL_MATCHER =
  /((https?:\/\/(www\.)?)|(www\.))[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/;

function useSuspenseRequest(url: string) {
  let cached = PREVIEW_CACHE[url];

  if (!url.match(URL_MATCHER)) {
    return { preview: null };
  }

  if (!cached) {
    cached = PREVIEW_CACHE[url] = fetch(`/api/link-preview?url=${encodeURI(url)}`)
      .then((response) => response.json())
      .then((preview) => {
        PREVIEW_CACHE[url] = preview;
        return preview;
      })
      .catch(() => {
        PREVIEW_CACHE[url] = { preview: null };
      });
  }

  if (cached instanceof Promise) {
    throw cached;
  }

  return cached;
}

function LinkPreviewContent({
  url,
}: Readonly<{
  url: string;
}>): JSX.Element | null {
  const { preview } = useSuspenseRequest(url);
  if (preview === null) {
    return null;
  }
  return (
    <LinkPreviewContainer>
      <div className="LinkPreview__container">
        {preview.img && (
          <div className="LinkPreview__imageWrapper">
            <Image src={preview.img} alt={preview.title} className="LinkPreview__image" />
          </div>
        )}
        {preview.domain && <div className="LinkPreview__domain">{preview.domain}</div>}
        {preview.title && <div className="LinkPreview__title">{preview.title}</div>}
        {preview.description && (
          <div className="LinkPreview__description">{preview.description}</div>
        )}
      </div>
    </LinkPreviewContainer>
  );
}

function Glimmer(props: { style: CSSProperties; index: number }): JSX.Element {
  return (
    <div
      className="LinkPreview__glimmer"
      {...props}
      style={{
        animationDelay: String((props.index || 0) * 300),
        ...(props.style || {}),
      }}
    />
  );
}

export default function LinkPreview({
  url,
}: Readonly<{
  url: string;
}>): JSX.Element {
  return (
    <Suspense
      fallback={
        <>
          <Glimmer style={{ height: "80px" }} index={0} />
          <Glimmer style={{ width: "60%" }} index={1} />
          <Glimmer style={{ width: "80%" }} index={2} />
        </>
      }
    >
      <LinkPreviewContent url={url} />
    </Suspense>
  );
}
