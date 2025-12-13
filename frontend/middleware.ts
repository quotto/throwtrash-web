import { NextRequest } from 'next/server';
import createI18nMiddleware from 'next-i18n-router';
import i18nConfig from './i18n.config';

const I18nMiddleware = createI18nMiddleware(i18nConfig);

export function middleware(request: NextRequest) {
    return I18nMiddleware(request);
}

export const config = {
    matcher: ['/((?!_next|api|.*\\..*).*)']
};
