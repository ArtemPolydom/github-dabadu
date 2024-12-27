import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Loader2, X } from 'lucide-react';
import { usePlacesAutocomplete } from '@/hooks/usePlacesAutocomplete';
import { ParsingLoader } from './ParsingLoader';
import { createDemoAgent } from '@/lib/api/demoAgent';
import { parsePropertyInfo } from '@/lib/api/propertyParser';
import { AIReceptionistCard } from './AIReceptionistCard';
import { ErrorBanner } from './ErrorBanner';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ANONYMOUS_USER } from '@/lib/constants/user';

export function LandingPage() {
  const { t } = useTranslation();
  const { selectedPlace, error, clearSelection } = usePlacesAutocomplete();
  const [isParsing, setIsParsing] = useState(false);
  const [hasStartedParsing, setHasStartedParsing] = useState(false);
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [setupComplete, setSetupComplete] = useState(false);
  const [parsingProgress, setParsingProgress] = useState(0);
  const [parserResult, setParserResult] = useState<any>(null);
  const [agentId, setAgentId] = useState<string>('');
  const [processingError, setProcessingError] = useState(false);
  const [errorContext, setErrorContext] = useState<'parsing' | 'agentCreation' | null>(null);
  const [agentCreationStarted, setAgentCreationStarted] = useState(false);

  const createAgent = async () => {
    try {
      setErrorContext(null);

      if (!parserResult || !selectedPlace) {
        setProcessingError(true);
        setErrorContext('agentCreation');
        return;
      }

      const response = await createDemoAgent({
        client_data: {
          ...ANONYMOUS_USER,
          business_name: selectedPlace.name,
          business_address: selectedPlace.formatted_address
        },
        property_data: parserResult,
        property_type: 'hotel',
      });

      if (!response || !response.agent || !response.agent.phone) {
        throw new Error('Invalid response from agent creation API');
      }

      setAgentId(response.agent.id);
      setIsSettingUp(false);
      setSetupComplete(true);
      setProcessingError(false);
      setErrorContext(null);
    } catch (error) {
      console.error('Error creating agent:', error);
      setIsSettingUp(false);
      setSetupComplete(false);
      setProcessingError(true);
      setErrorContext('agentCreation');
      setAgentCreationStarted(false);
    }
  };

  useEffect(() => {
    if (parserResult && !agentCreationStarted) {
      setAgentCreationStarted(true);
      setIsSettingUp(true);
      createAgent();
    }
  }, [parserResult, agentCreationStarted]);

  const handleFindProperty = async () => {
    if (!selectedPlace) return;

    setProcessingError(false);
    setErrorContext(null);
    setParsingProgress(0);
    setHasStartedParsing(true);
    setIsParsing(true);
    setParserResult(null);
    setAgentCreationStarted(false);

    try {
      await parsePropertyInfo(selectedPlace, {
        onProgress: setParsingProgress,
        onSemiResult: () => {},
        onComplete: (result) => {
          setParserResult(result);
        },
        onError: () => {
          setProcessingError(true);
          setErrorContext('parsing');
        }
      });
    } catch (error) {
      console.error('Find property error:', error);
      setProcessingError(true);
      setErrorContext('parsing');
    }
  };

  const handleRetry = () => {
    if (errorContext === 'parsing') {
      handleFindProperty();
    } else if (errorContext === 'agentCreation' && parserResult) {
      setProcessingError(false);
      setIsSettingUp(true);
      setAgentCreationStarted(false);
    }
  };

  return (
    <div className="min-h-screen bg-white pt-4 md:pt-2">
      <div className="flex h-12 md:h-14 items-center justify-between px-4 md:px-6">
        <a href="/" className="flex items-center">
          <img
            className="h-8 md:h-10 lg:h-12 w-auto"
            alt="Polydom Logo"
            src="https://unicorn-images.b-cdn.net/a07693f5-fe0a-4d8b-9021-09fa66e8f68a?optimizer=gif"
          />
        </a>
        <LanguageSwitcher />
      </div>
      <div className="flex flex-col items-center justify-center px-4 py-6 text-center">
        {!hasStartedParsing && !setupComplete && (
          <>
            <h1 className="max-w-3xl text-4xl font-bold leading-tight text-gray-900 lg:text-5xl">
              <span className="block text-3xl lg:text-4xl mb-2">
                {t('landing.title.meet')}
              </span>
              <span className="block text-4xl lg:text-6xl">
                <span className="text-green-500">AI</span> {t('landing.title.employee')}
              </span>
            </h1>

            <p className="font-semibold mt-6 text-lg text-gray-700 max-w-2xl">
              {t('landing.subtitle')}
            </p>
          </>
        )}

        {processingError && (
          <div className="w-full max-w-2xl mt-4">
            <ErrorBanner onRetry={handleRetry} />
          </div>
        )}

        {!setupComplete && (
          <>
            {isParsing && hasStartedParsing ? (
              <div className="w-full max-w-2xl mt-8 mb-12">
                <ParsingLoader
                  progress={parsingProgress}
                  isSettingUp={isSettingUp}
                  isParsingComplete={!!parserResult}
                />
              </div>
            ) : (
              <div className="mt-8 w-full max-w-md">
                <div className="relative">
                  {selectedPlace && !isParsing ? (
                    <button
                      onClick={clearSelection}
                      className="absolute left-3 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity"
                      aria-label={t('landing.search.clear')}
                    >
                      <X className="h-5 w-5 text-gray-400" />
                    </button>
                  ) : (
                    <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  )}

                  <input
                    id="search-input"
                    type="text"
                    placeholder={t('landing.search.placeholder')}
                    className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-12 text-gray-900 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                  />
                </div>
                {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
                <button
                  className="mt-4 w-full rounded-lg bg-green-500 px-4 py-3 font-semibold text-white hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  disabled={!selectedPlace || isParsing}
                  onClick={handleFindProperty}
                >
                  {isParsing ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('landing.search.processing')}
                    </span>
                  ) : (
                    t('landing.search.button')
                  )}
                </button>
              </div>
            )}
          </>
        )}

        {setupComplete && selectedPlace && (
          <div className="flex flex-col items-center w-full">
            <AIReceptionistCard
              businessName={selectedPlace.name}
              state={selectedPlace.state}
              country={selectedPlace.country}
              agentId={agentId}
            />
          </div>
        )}

        {!isParsing && !setupComplete && (
          <a
            href="https://polydom.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
          >
            {t('landing.discover')}
          </a>
        )}
      </div>
    </div>
  );
}