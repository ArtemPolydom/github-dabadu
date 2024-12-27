import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { LucideIcon } from 'lucide-react';
import { PARSING_MESSAGES, SETUP_MESSAGES } from '@/lib/constants/messages';

interface ParsingLoaderProps {
  progress?: number;
  isSettingUp?: boolean;
  isParsingComplete?: boolean;
}

interface ParsingMessage {
  titleKey: string;
  textKey: string;
  icon: LucideIcon;
}

export function ParsingLoader({ 
  progress = 0,
  isSettingUp = false,
  isParsingComplete = false
}: ParsingLoaderProps) {
  const [currentMessage, setCurrentMessage] = useState(0);
  const { t } = useTranslation();

  useEffect(() => {
    const messages = isSettingUp ? SETUP_MESSAGES : PARSING_MESSAGES;
    const interval = setInterval(() => {
      setCurrentMessage((prev) => (prev === messages.length - 1 ? 0 : prev + 1));
    }, 4000);

    return () => clearInterval(interval);
  }, [isSettingUp]);

  const messages = isSettingUp ? SETUP_MESSAGES : PARSING_MESSAGES;
  const currentMessageData = messages[currentMessage];
  const MessageIcon = !isSettingUp && 'icon' in currentMessageData ? currentMessageData.icon : undefined;
  const displayProgress = isParsingComplete ? 100 : Math.min(95, progress);

  return (
    <div className="flex flex-col items-center justify-center space-y-6 p-8 bg-white/50 backdrop-blur-sm rounded-lg">
      {!isSettingUp && MessageIcon && (
        <div className="relative">
          <div className="absolute inset-0 animate-ping">
            <MessageIcon className="w-12 h-12 text-green-500 opacity-75" />
          </div>
          <MessageIcon className="w-12 h-12 text-green-500 relative" />
        </div>
      )}
      
      <div className="w-full max-w-md h-2 bg-gray-100 rounded-full overflow-hidden">
        <div 
          className="h-full bg-green-500 transition-all duration-300 ease-in-out"
          style={{ width: `${displayProgress}%` }}
        />
      </div>
      
      <div className="space-y-2 text-center transition-all duration-300">
        <h3 className="text-2xl font-semibold text-gray-900">
          {t(typeof currentMessageData === 'string' ? currentMessageData : currentMessageData.titleKey)}
        </h3>
        {!isSettingUp && 'textKey' in currentMessageData && (
          <p className="text-base text-gray-600 max-w-xl leading-relaxed">
            {t(currentMessageData.textKey)}
          </p>
        )}
      </div>
    </div>
  );
}