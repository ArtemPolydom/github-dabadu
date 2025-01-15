import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Phone, MapPin, CalendarDays, RotateCcw } from 'lucide-react';

interface AIReceptionistCardProps {
  businessName: string;
  state: string;
  country: string;
  agentId: string;
  onStartAgain?: () => void;
}

declare global {
  interface Window {
    chatWidgetConfig?: any;
    polyCallAPI?: any;
  }
}

export function AIReceptionistCard({
  businessName,
  state,
  country,
  agentId,
  onStartAgain,
}: AIReceptionistCardProps) {
  const { t, i18n } = useTranslation();
  const [isEnabled, setIsEnabled] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isRestartLocked, setIsRestartLocked] = useState(false);
  const getLocation = () => {
    return `${state}, ${country === 'United States' ? 'USA' : country}`;
  };

  const initializeWidget = () => {
    window.chatWidgetConfig = {
      staticUrl: 'https://una-call-js.polydom.ai/latest',
      callRecording: true,
      agentId: agentId,
      stage: true,
      contextData: {
        email: 'example@polydom.ai',
      },
      enableScreenLock: false,
      enableCallSound: true,
      language: i18n.language,
    };

    const script = document.createElement('script');
    script.type = 'module';
    script.async = true;
    script.src =
      window.chatWidgetConfig.staticUrl +
      '/js/init_script.js?' +
      new Date().getTime();

    script.onerror = () => {
      console.error('Failed to load init_script.js');
      setErrorMsg(t('call.error.load'));
      setIsEnabled(false);
    };

    document.body.appendChild(script);
    return script;
  };

  useEffect(() => {
    const script = initializeWidget();
    return () => {
      if (script && script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [agentId, i18n.language]);

  useEffect(() => {
    const handlePolyStatus = (event: CustomEvent) => {
      const { status, message } = event.detail;
      if (status === 'success') {
        setIsEnabled(true);
        setErrorMsg('');
      } else {
        setIsEnabled(false);
        setErrorMsg(message || t('call.error.init'));
      }
    };

    const handleStartCall = () => {
      setIsCallActive(true);
    };

    const handleEndCall = () => {
      setIsCallActive(false);
      setIsRestartLocked(false);
    };

    const handleCallError = (event: CustomEvent) => {
      const message = event.detail.error || event.detail.message;
      setErrorMsg(message);
      setIsCallActive(false);
      setIsRestartLocked(false);
    };

    window.addEventListener('polyStatus', handlePolyStatus as EventListener);
    window.addEventListener('polyStartCall', handleStartCall);
    window.addEventListener('polyEndCall', handleEndCall);
    window.addEventListener('polyCallError', handleCallError as EventListener);

    return () => {
      window.removeEventListener('polyStatus', handlePolyStatus as EventListener);
      window.removeEventListener('polyStartCall', handleStartCall);
      window.removeEventListener('polyEndCall', handleEndCall);
      window.removeEventListener('polyCallError', handleCallError as EventListener);
    };
  }, [t]);

  const handleCall = () => {
    if (!isEnabled || !window.polyCallAPI) return;
    setIsRestartLocked(true);
    if (isCallActive) {
      window.polyCallAPI.endCall();
    } else {
      window.polyCallAPI.makeCall();
    }
  };

  const handleBookDemo = () => {
    window.open('https://cal.com/polydom/30min', '_blank');
  };

  return (
    <div className="flex flex-col items-center w-full">
      <div className="flex items-center justify-center gap-2 mb-2">
        <div className="w-6 h-20 flex-shrink-0">
          <MapPin className="w-full h-full text-emerald-500" />
        </div>
        <div className="text-base md:text-lg text-gray-600 truncate">
          {businessName} • {getLocation()}
        </div>
      </div>

      <h1 className="text-center max-w-2xl text-2xl font-bold leading-tight lg:text-4xl mb-8">
        <span className="text-gray-900">{t('call.title')}</span>
        <span className="block text-emerald-500">{t('call.ready')}</span>
      </h1>

      <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow-lg px-8 pb-8">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
          {t('call.subtitle')}
        </h2>

        <div className="flex flex-col items-center gap-6">
          <button
            onClick={handleCall}
            disabled={!isEnabled}
            className={`relative flex items-center gap-2 px-8 py-4 rounded-lg font-semibold transition-all duration-300 w-full justify-center
              ${
                !isEnabled
                  ? 'bg-gray-400 cursor-not-allowed opacity-60'
                  : isCallActive
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-emerald-500 hover:bg-emerald-600'
              } text-white text-lg`}
          >
            <Phone className="w-6 h-6" />
            <span>
              {isCallActive ? t('call.button.end') : t('call.button.call')}
            </span>
            {isEnabled && !isCallActive && (
              <div className="absolute -inset-1 bg-emerald-500/20 rounded-lg animate-pulse" />
            )}
          </button>

          {errorMsg && (
            <div className="text-red-600 font-medium text-center">
              {errorMsg}
            </div>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex flex-col gap-4">
            <button
              onClick={handleBookDemo}
              className="flex flex-col items-center justify-center gap-1 bg-white text-blue-600 py-3 px-6 rounded-lg border border-blue-600 hover:bg-blue-50 transition-colors w-full"
            >
              <div className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5" />
                <span className="font-medium">
                  {t('landing.book.button')}
                </span>
              </div>
              <span className="text-sm text-gray-600">
                {t('landing.book.learn')}
              </span>
            </button>

            {onStartAgain && (
              <button
                  onClick={() => {
                  if (isRestartLocked || isCallActive) return; // Prevent execution if locked or call active
                  setIsRestartLocked(true); // Lock restarting
                  try {
                    onStartAgain(); // Trigger restart function
                  } finally {
                    setTimeout(() => setIsRestartLocked(false), 500); // Unlock after a delay
                  }
                }}
                disabled={isRestartLocked || isCallActive}
                className="flex items-center justify-center gap-2 text-gray-600 py-3 px-6 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                <RotateCcw className="w-5 h-5" />
                <span>
                  {t('landing.restart.button')}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}