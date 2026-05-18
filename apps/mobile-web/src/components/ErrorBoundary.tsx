import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props { children: ReactNode; }
interface State { hasError: boolean; error?: Error; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) console.error('ErrorBoundary caught:', error, info);
  }

  reset = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.href = '/';
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-orange-50 to-white dark:from-zinc-900 dark:to-zinc-950">
        <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-950 flex items-center justify-center mb-4">
          <AlertTriangle size={40} className="text-red-500" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Kuch gadbad ho gayi</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 text-center mb-6 max-w-xs">
          App mein ek unexpected error aaya. Page refresh karke try karo.
        </p>
        {import.meta.env.DEV && this.state.error && (
          <pre className="text-xs bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 p-3 rounded-lg max-w-md overflow-auto mb-4">
            {this.state.error.message}
          </pre>
        )}
        <button
          onClick={this.reset}
          className="flex items-center gap-2 bg-primary-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-primary-600 transition"
        >
          <RefreshCw size={18} /> Home pe wapas jao
        </button>
      </div>
    );
  }
}
