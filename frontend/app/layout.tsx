import './globals.css';
import type { Metadata } from 'next';
import React from 'react';
import Providers from './providers/StoreProvider';
import ReactQueryProvider from './providers/ReactQueryProvider';
import { dehydrate, QueryClient } from '@tanstack/react-query';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter';
import { cookies } from 'next/headers';

export const metadata: Metadata = {
    title: 'TrashSchedule (App Router)',
    description: 'Next.js App Router migration'
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
    // SSRでAuthをプリフェッチしてdehydrate
    const qc = new QueryClient();
    const cookieHeader = cookies().toString();
    await qc.prefetchQuery({
        queryKey: ['auth','session'],
        queryFn: async () => {
            try {
                // クライアントのCookieを維持するため内部API経由で取得
                const res = await fetch('/api/user_info', {
                    credentials: 'include',
                    headers: {
                        cookie: cookieHeader
                    },
                    cache: 'no-store'
                });
                if (!res.ok) throw new Error('ng');
                return await res.json();
            } catch {
                return null;
            }
        }
    });
    const dehydratedState = dehydrate(qc);

    return (
        <html lang="ja">
            <body>
                <AppRouterCacheProvider options={{ key: 'mui' }}>
                    <ReactQueryProvider dehydratedState={dehydratedState}>
                        <Providers>
                            {children}
                        </Providers>
                    </ReactQueryProvider>
                </AppRouterCacheProvider>
            </body>
        </html>
    );
}
