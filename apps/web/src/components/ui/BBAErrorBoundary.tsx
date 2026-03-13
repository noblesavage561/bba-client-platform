"use client";

import { ReactNode, Component, ErrorInfo } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class BBAErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error for debugging
    console.error("BBAErrorBoundary caught error:", error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // Could send to error tracking service here (e.g., Sentry)
    // captureException(error, { contexts: { react: errorInfo } });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] to-[#16213e] flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-8 border-l-4 border-red-500">
            <div className="text-center">
              <div className="text-5xl mb-4">⚠️</div>
              <h1 className="text-2xl font-bold text-[#414042] mb-4">
                Something went wrong
              </h1>
              <p className="text-gray-700 mb-4">
                We{"'"}re sorry for the inconvenience. We{"'"}ve logged this error and our team will investigate.
              </p>

              {process.env.NODE_ENV === "development" && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left max-h-48 overflow-auto">
                  <p className="text-xs font-mono text-red-900 mb-2">
                    <strong>Error:</strong>
                  </p>
                  <p className="text-xs text-red-800 mb-4">
                    {this.state.error?.message}
                  </p>
                  {this.state.errorInfo && (
                    <>
                      <p className="text-xs font-mono text-red-900 mb-2">
                        <strong>Component Stack:</strong>
                      </p>
                      <pre className="text-xs text-red-800 overflow-auto">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </>
                  )}
                </div>
              )}

              <Button
                onClick={this.handleReset}
                className="bg-[#1591cd] text-white hover:bg-[#0d6aaa] w-full"
              >
                Try Again
              </Button>

              <Button
                onClick={() => {
                  window.location.href = "/portal";
                }}
                variant="secondary"
                className="w-full mt-3"
              >
                Go to Dashboard
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export function BBAErrorBoundaryWrapper({
  children,
}: {
  children: ReactNode;
}) {
  return <BBAErrorBoundary>{children}</BBAErrorBoundary>;
}
