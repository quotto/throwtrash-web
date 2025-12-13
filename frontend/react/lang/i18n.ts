
/* eslint-disable import/no-named-as-default-member */
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import ja from './ja.json';
import en from './en.json';

i18next.use(initReactI18next).init({
    debug: false,
    resources: {
        en,
        ja
    },
    interpolation: { escapeValue: false },
    fallbackLng: 'ja',
    supportedLngs: ['ja', 'en'],
    react: {
        useSuspense: false
    }
});

export default i18next;
