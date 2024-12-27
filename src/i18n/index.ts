import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { languages } from './languages';
import { loadTranslations } from './loadTranslations';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: loadTranslations(),
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export { languages };
export default i18n;