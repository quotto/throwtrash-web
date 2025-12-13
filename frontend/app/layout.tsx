import './globals.css';
import type { Metadata } from 'next';
import React from 'react';
import Providers from './providers/StoreProvider';
import ReactQueryProvider from './providers/ReactQueryProvider';
import { dehydrate, QueryClient } from '@tanstack/react-query';
import { AUTH_QUERY_KEY } from './hooks/useAuthQuery';

export const metadata: Metadata = {
    title: 'TrashSchedule (App Router)',
    description: 'Next.js App Router migration'
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
    // SSRでAuthをプリフェッチしてdehydrate
    const qc = new QueryClient();
    await qc.prefetchQuery({
        queryKey: ['auth','session'],
        queryFn: async () => {
            try {
                const apiHost = process.env.API_HOST;
                const apiStage = process.env.API_STAGE;
                const apiBase = `https://${apiHost}/${apiStage}`;
                const res = await fetch(`${apiBase}/user_info`, {
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
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
                <ReactQueryProvider dehydratedState={dehydratedState}>
                    <Providers>
                        {children}
                    </Providers>
                </ReactQueryProvider>
            </body>
        </html>
    );
}
