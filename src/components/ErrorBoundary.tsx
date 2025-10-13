import { Component, ReactNode } from 'react';
import { Alert } from '@mantine/core';

export class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error?: Error }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return <Alert color="red" title="Something went wrong">{this.state.error?.message}</Alert>;
    }
    return this.props.children;
  }
}
