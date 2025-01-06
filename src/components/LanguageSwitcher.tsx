import { useTranslation } from 'react-i18next';
import { languages } from '@/i18n';
import { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function LanguageSwitcher() {
  const { t, i18n } = useTranslation();
  const [isCallActive, setIsCallActive] = useState(false);

  useEffect(() => {
    const handleStartCall = () => {
      console.log('Call started - disabling language switch');
      setIsCallActive(true);
    };

    const handleEndCall = () => {
      console.log('Call ended - enabling language switch');
      setIsCallActive(false);
    };

    const handlePolyStartCall = (event: Event) => {
      handleStartCall();
    };

    const handlePolyEndCall = (event: Event) => {
      handleEndCall();
    };

    window.addEventListener('polyStartCall', handlePolyStartCall);
    window.addEventListener('polyEndCall', handlePolyEndCall);

    return () => {
      window.removeEventListener('polyStartCall', handlePolyStartCall);
      window.removeEventListener('polyEndCall', handlePolyEndCall);
    };
  }, []);

  const handleLanguageChange = (value: string) => {
    if (isCallActive) {
      return;
    }
    i18n.changeLanguage(value);
  };

  return (
    <div className="relative min-w-[180px]">
      <Select
        value={i18n.language}
        onValueChange={handleLanguageChange}
        disabled={isCallActive}
      >
        <SelectTrigger 
          className={`w-[180px] ${
            isCallActive ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
          }`}
        >
          <SelectValue placeholder="Select language" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(languages).map(([code, { nativeName }]) => (
            <SelectItem 
              key={code} 
              value={code}
              className={isCallActive ? 'pointer-events-none' : ''}
            >
              {nativeName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isCallActive && (
        <div className="absolute -bottom-8 left-0 text-xs text-grey-200 w-[180px] text-center">
          {t('landing.language.block')}
        </div>
      )}
    </div>
  );
}