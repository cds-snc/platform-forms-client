import React, { Component, ErrorInfo, ReactNode } from "react";
import { useRouter } from "next/router";
import { ErrorPanel } from "./ErrorPanel";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

// use for testing error boundary
export const TriggerError = () => {
  const router = useRouter();
  const { forceError } = router.query;

  if (forceError) {
    // Simulate a JS error
    throw new Error("I crashed!");
  }
  return null;
};

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    /* eslint-disable no-console */
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback ? this.props.fallback : <ErrorPanel />;
    }

    return this.props.children;
  }
}
