import { AlertTriangle, RefreshCw, ExternalLink } from 'lucide-react';

interface ErrorBannerProps {
  onRetry: () => void;
}

export function ErrorBanner({ onRetry }: ErrorBannerProps) {
  return (
    <div className="w-full max-w-2xl bg-red-50 border border-red-200 rounded-lg p-6">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="rounded-full bg-red-100 p-3">
          <AlertTriangle className="w-6 h-6 text-red-600" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900">
            Processing Error
          </h3>
          <p className="text-gray-600">
            We encountered an issue while processing your request. Please try again or contact our support team for assistance.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={onRetry}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
          
          <a
            href="https://polydom.ai/support/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-100 rounded-lg hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
          >
            Contact Support
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}