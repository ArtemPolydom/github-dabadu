import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PARSING_MESSAGES } from '@/lib/constants';

interface ParsingLoaderProps {
  onAllMessagesShown: () => void;
  forceComplete?: boolean;
  onMessageChange?: (index: number) => void;
}

export function ParsingLoader({ onAllMessagesShown, forceComplete, onMessageChange }: ParsingLoaderProps) {
  const [currentMessage, setCurrentMessage] = useState(0);
  const [allMessagesShown, setAllMessagesShown] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    if (allMessagesShown || forceComplete) return;

    const timer = setInterval(() => {
      if (currentMessage === PARSING_MESSAGES.length - 1) {
        clearInterval(timer);
        setTimeout(() => {
          setAllMessagesShown(true);
          onAllMessagesShown();
        }, 4000);
      } else {
        const nextMessage = currentMessage + 1;
        setCurrentMessage(nextMessage);
        onMessageChange?.(nextMessage);
      }
    }, 4000);

    return () => clearInterval(timer);
  }, [currentMessage, allMessagesShown, onAllMessagesShown, forceComplete, onMessageChange]);

  useEffect(() => {
    if (forceComplete && !allMessagesShown) {
      setAllMessagesShown(true);
      onAllMessagesShown();
    }
  }, [forceComplete, allMessagesShown, onAllMessagesShown]);

  const currentMessageData = PARSING_MESSAGES[currentMessage];
  const MessageIcon = currentMessageData.icon;

  return (
    <div className="flex flex-col items-center justify-center space-y-6 p-8 bg-white/50 backdrop-blur-sm rounded-lg">
      <div className="relative">
        <div className="absolute inset-0 animate-ping">
          <MessageIcon className="w-12 h-12 text-green-500 opacity-75" />
        </div>
        <MessageIcon className="w-12 h-12 text-green-500 relative" />
      </div>
      
      <div className="w-full max-w-md h-2 bg-gray-100 rounded-full overflow-hidden">
        <div 
          className="h-full bg-green-500 transition-all duration-300 ease-in-out"
          style={{ 
            width: `${((currentMessage + 1) / PARSING_MESSAGES.length) * 100}%`,
            transition: 'width 0.3s ease-in-out'
          }}
        />
      </div>
      
      <div className="space-y-2 text-center transition-all duration-300">
        <h3 className="text-2xl font-semibold text-gray-900">
          {t(currentMessageData.titleKey)}
        </h3>
        <p className="text-base text-gray-600 max-w-xl leading-relaxed">
          {t(currentMessageData.textKey)}
        </p>
      </div>
    </div>
  );
}