import { NextRequest, NextResponse } from 'next/server';
import { i18nRouter } from 'next-i18n-router';
import i18nConfig from './i18n.config';

export function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;
    // ロケール付きのパスのみ next-i18n-router に委譲し、それ以外は透過
    if (path.startsWith('/ja') || path.startsWith('/en')) {
        return i18nRouter(request, i18nConfig);
    }
    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next|api|.*\\..*).*)']
};
