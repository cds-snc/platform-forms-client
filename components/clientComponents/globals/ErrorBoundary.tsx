"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { ErrorPanel } from "@clientComponents/globals/ErrorPanel";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log client-side errors
    // eslint-disable-next-line no-console
    console.error("Uncaught client error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback ? this.props.fallback : <ErrorPanel supportLink={false} />;
    }

    return this.props.children ?? null;
  }
}

export default ErrorBoundary;
