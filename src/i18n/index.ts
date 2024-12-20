import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './locales/en.json';
import de from './locales/de.json';
import fr from './locales/fr.json';
import cs from './locales/cs.json';
import pt from './locales/pt.json';
import tr from './locales/tr.json';
import it from './locales/it.json';
import ru from './locales/ru.json';

export const languages = {
  en: { nativeName: 'English' },
  ru: { nativeName: 'Русский' },
  de: { nativeName: 'Deutsch' },
  fr: { nativeName: 'Français' },
  cs: { nativeName: 'Čeština' },
  pt: { nativeName: 'Português' },
  tr: { nativeName: 'Türkçe' },
  it: { nativeName: 'Italiano' },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ru: { translation: ru },
      de: { translation: de },
      fr: { translation: fr },
      cs: { translation: cs },
      pt: { translation: pt },
      tr: { translation: tr },
      it: { translation: it },
    },
    lng: 'en', // Force English as default
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;