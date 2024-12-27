import en from './locales/en.json';
import ru from './locales/ru.json';
import de from './locales/de.json';
import fr from './locales/fr.json';
import cs from './locales/cs.json';
import pt from './locales/pt.json';
import tr from './locales/tr.json';
import it from './locales/it.json';
import sv from './locales/sv.json';
import zh from './locales/zh.json';

export function loadTranslations() {
  return {
    en: { translation: en },
    ru: { translation: ru },
    de: { translation: de },
    fr: { translation: fr },
    cs: { translation: cs },
    pt: { translation: pt },
    tr: { translation: tr },
    it: { translation: it },
    sv: { translation: sv },
    zh: { translation: zh }
  };
}