import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Loader2, X } from 'lucide-react';
import { usePlacesAutocomplete, type PlaceResult } from '@/hooks/usePlacesAutocomplete';
import { ParsingLoader } from './ParsingLoader';
import { PropertyCard } from './PropertyCard';
import { ContactForm } from './ContactForm';
import { createDemoAgent } from '@/lib/api';
import { FinalSetupLoader } from './FinalSetupLoader';
import { AIReceptionistCard } from './AIReceptionistCard';
import { ErrorBanner } from './ErrorBanner';
import { LanguageSwitcher } from './LanguageSwitcher';

const PARSER_API = 'https://property-parser-no-phone.replit.app/api/parse_property_info_stream';

const LandingPage = () => {
  const { t } = useTranslation();
  const { selectedPlace, error, clearSelection } = usePlacesAutocomplete();
  const [isParsing, setIsParsing] = useState(false);
  const [hasStartedParsing, setHasStartedParsing] = useState(false);
  const [allMessagesShown, setAllMessagesShown] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [setupComplete, setSetupComplete] = useState(false);
  const [propertyDescription, setPropertyDescription] = useState<string>('');
  const [isParsingComplete, setIsParsingComplete] = useState(false);
  const [hasReceivedSemiResult, setHasReceivedSemiResult] = useState(false);
  const [parsingProgress, setParsingProgress] = useState(0);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [parserResult, setParserResult] = useState<any>(null);
  const [pendingContactData, setPendingContactData] = useState<any>(null);
  const [agentId, setAgentId] = useState<string>('');
  const [processingError, setProcessingError] = useState(false);
  const [errorContext, setErrorContext] = useState<'parsing' | 'agentCreation' | null>(null);
  const [showHelpTooltip, setShowHelpTooltip] = useState(false);
  const [agentCreationStarted, setAgentCreationStarted] = useState(false);

  const helpButtonRef = useRef<HTMLButtonElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isParsingComplete && isSettingUp && pendingContactData && parserResult && !agentCreationStarted) {
      setAgentCreationStarted(true);
      const createAgentAsync = async () => {
        try {
          await createAgent(pendingContactData, parserResult);
        } catch (error) {
          console.error('Agent creation failed:', error);
        }
      };
      createAgentAsync();
    }
  }, [isParsingComplete, isSettingUp, pendingContactData, parserResult, agentCreationStarted]);

  const createAgent = async (contactData: any, propertyData: any) => {
    try {
      setErrorContext(null);

      if (!propertyData || !contactData) {
        setProcessingError(true);
        setErrorContext('agentCreation');
        return;
      }

      const response = await createDemoAgent({
        client_data: contactData,
        property_data: propertyData,
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

  const parsePropertyInfo = async (place: PlaceResult) => {
    setProcessingError(false);
    setErrorContext(null);

    const requestBody = {
      search_query: `${place.name} ${place.formatted_address}`,
      country: place.country,
      property_type: 'hotel',
      semi_result: true,
    };

    try {
      const response = await fetch(PARSER_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer FPqbMiRG8Ugaq6lKO0vbpwhJjxha9ghnepg52SNS5tI',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Failed to connect to the server (${response.status})`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Failed to initialize data stream');
      }

      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += new TextDecoder().decode(value);
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines.filter((line) => line.trim())) {
          try {
            const data = JSON.parse(line);

            if (data.progress) {
              setParsingProgress(data.progress);
            }

            if (data.semi_summary) {
              setPropertyDescription(data.semi_summary);
              setHasReceivedSemiResult(true);
            }

            if (data.status === 'completed' || data.status === 'All set! Your property details are ready!') {
              if (data.result) {
                setParserResult(data.result);
                setIsParsingComplete(true);
                if (data.result?.description) {
                  setPropertyDescription(data.result.description);
                }
              }
            }
          } catch (e) {
            if (line.trim() && !line.includes('"unique_selling_points"')) {
              setProcessingError(true);
              setErrorContext('parsing');
            }
          }
        }
      }
    } catch (error) {
      console.error('Processing error:', error);
      setProcessingError(true);
      setErrorContext('parsing');
      setIsParsing(false);
      setHasStartedParsing(false);
      setShowContactForm(false);
    }
  };

  const handleFindProperty = async () => {
    if (!selectedPlace) return;

    setProcessingError(false);
    setErrorContext(null);
    setParsingProgress(0);
    setAllMessagesShown(false);
    setHasStartedParsing(true);
    setIsParsing(true);
    setHasReceivedSemiResult(false);
    setIsParsingComplete(false);
    setParserResult(null);
    setPendingContactData(null);
    setAgentCreationStarted(false);

    try {
      await parsePropertyInfo(selectedPlace);
    } catch (error) {
      console.error('Find property error:', error);
      setProcessingError(true);
      setErrorContext('parsing');
    }
  };

  const handleRetry = () => {
    if (errorContext === 'parsing') {
      handleFindProperty();
    } else if (errorContext === 'agentCreation') {
      if (isParsingComplete && pendingContactData && parserResult) {
        setProcessingError(false);
        setIsSettingUp(true);
        setAgentCreationStarted(false);
      }
    }
  };

  useEffect(() => {
    if (hasReceivedSemiResult && allMessagesShown) {
      setIsParsing(false);
      setShowContactForm(true);
    }
  }, [hasReceivedSemiResult, allMessagesShown]);

  const handleContactSubmit = async (data: {
    name: string;
    email: string;
    business_address: string;
    phone: string;
    business_name: string;
  }) => {
    setPendingContactData(data);
    setIsSettingUp(true);
    setErrorContext(null);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showHelpTooltip &&
        helpButtonRef.current &&
        tooltipRef.current &&
        !helpButtonRef.current.contains(event.target as Node) &&
        !tooltipRef.current.contains(event.target as Node)
      ) {
        setShowHelpTooltip(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showHelpTooltip]);

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

        {!showContactForm && (
          <>
            {isParsing && hasStartedParsing && (
              <div className="w-full max-w-2xl mt-8 mb-12">
                <ParsingLoader
                  onAllMessagesShown={() => setAllMessagesShown(true)}
                  forceComplete={hasReceivedSemiResult && currentMessageIndex === 0}
                  onMessageChange={setCurrentMessageIndex}
                />
              </div>
            )}

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
          </>
        )}

        {showContactForm && selectedPlace && !isSettingUp && !setupComplete && (
          <div className="mt-8 grid md:grid-cols-2 gap-8 w-full max-w-4xl">
            <PropertyCard
              name={selectedPlace.name}
              address={selectedPlace.formatted_address}
              country={selectedPlace.country}
              state={selectedPlace.state}
              isParsingComplete={isParsingComplete}
              description={propertyDescription}
            />
            <ContactForm
              onSubmit={handleContactSubmit}
              businessName={selectedPlace.name}
              businessAddress={selectedPlace.formatted_address}
            />
          </div>
        )}

        {isSettingUp && (
          <div className="mt-8 w-full max-w-md">
            <FinalSetupLoader
              parsingProgress={parsingProgress}
              isParsingComplete={isParsingComplete}
            />
          </div>
        )}

        {setupComplete && (
          <div className="flex flex-col items-center w-full">
            <AIReceptionistCard
              businessName={selectedPlace?.name || ''}
              state={selectedPlace?.state || ''}
              country={selectedPlace?.country || ''}
              agentId={agentId}
            />
          </div>
        )}

        {!isParsing && !showContactForm && (
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
};

export default LandingPage;