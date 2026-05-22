import { Component, type ReactNode, type ErrorInfo } from 'react';

interface Props { children: ReactNode; }
interface State { error: Error | null; }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error) { return { error }; }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black p-6">
          <div className="rounded-2xl border border-red-500/30 bg-red-500/[0.05] p-6 max-w-md text-center">
            <div className="text-lg font-medium text-red-400 mb-2">页面渲染出错</div>
            <div className="text-sm text-[#888] mb-3 break-all font-mono">{this.state.error.message}</div>
            <div className="text-xs text-[#555] mb-3 max-h-32 overflow-auto text-left">{this.state.error.stack?.slice(0, 500)}</div>
            <button onClick={() => this.setState({ error: null })} className="rounded-xl bg-white/10 px-4 py-2 text-sm text-[#fafafa] hover:bg-white/15">
              重试
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
