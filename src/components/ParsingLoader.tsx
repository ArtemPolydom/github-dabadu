import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PARSING_MESSAGES, SETUP_MESSAGES } from '@/lib/constants/messages';

interface ParsingLoaderProps {
  progress?: number;
  isSettingUp?: boolean;
  isParsingComplete?: boolean;
  isLoading?: boolean; // New prop to handle overall loading state
}

export function ParsingLoader({ 
  progress = 0,
  isSettingUp = false,
  isParsingComplete = false,
  isLoading = false
}: ParsingLoaderProps) {
  const [currentMessage, setCurrentMessage] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const messages = isSettingUp ? SETUP_MESSAGES : PARSING_MESSAGES;
    const interval = setInterval(() => {
      // Don't change messages if we're about to complete
      if (!isParsingComplete && isLoading) {
        setCurrentMessage((prev) => (prev === messages.length - 1 ? 0 : prev + 1));
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [isSettingUp, isParsingComplete, isLoading]);

  // Handle transition when loading completes
  useEffect(() => {
    if (!isLoading && isParsingComplete) {
      setFadeOut(true);
    } else {
      setFadeOut(false);
    }
  }, [isLoading, isParsingComplete]);

  const messages = isSettingUp ? SETUP_MESSAGES : PARSING_MESSAGES;
  const currentMessageData = messages[currentMessage];
  
  // Adjust progress display logic
  const displayProgress = (() => {
    if (isParsingComplete && isSettingUp) {
      return 98; // Near complete during setup
    } else if (isParsingComplete) {
      return 100; // Complete after parsing
    } else {
      return Math.min(95, progress); // Normal progress
    }
  })();

  return (
    <div 
      className={`flex flex-col items-center justify-center space-y-6 p-8 bg-white/50 backdrop-blur-sm rounded-lg transition-opacity duration-300 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {!isSettingUp && typeof currentMessageData !== 'string' && currentMessageData.icon && (
        <div className="relative">
          <div className={`absolute inset-0 ${isParsingComplete ? '' : 'animate-ping'}`}>
            <currentMessageData.icon className="w-12 h-12 text-emerald-500 opacity-75" />
          </div>
          <currentMessageData.icon className="w-12 h-12 text-emerald-500 relative" />
        </div>
      )}
      
      <div className="w-full max-w-md h-2 bg-gray-100 rounded-full overflow-hidden">
        <div 
          className="h-full bg-emerald-500 transition-all duration-300 ease-in-out"
          style={{ 
            width: `${displayProgress}%`,
            transitionTimingFunction: isParsingComplete ? 'ease-out' : 'linear'
          }}
        />
      </div>
      
      <div className="space-y-2 text-center transition-all duration-300">
        <h3 className="text-2xl font-semibold text-gray-900">
          {t(typeof currentMessageData === 'string' ? currentMessageData : currentMessageData.titleKey)}
        </h3>
        {!isSettingUp && typeof currentMessageData !== 'string' && (
          <p className="text-base text-gray-600 max-w-xl leading-relaxed">
            {t(currentMessageData.textKey)}
          </p>
        )}
      </div>
    </div>
  );
}