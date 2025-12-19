import './globals.css';
import type { Metadata } from 'next';
import React from 'react';
import Providers from './providers/StoreProvider';
import ReactQueryProvider from './providers/ReactQueryProvider';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter';

export const metadata: Metadata = {
    title: 'TrashSchedule (App Router)',
    description: 'Next.js App Router migration'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="ja">
            <body>
                <AppRouterCacheProvider options={{ key: 'mui' }}>
                    <ReactQueryProvider>
                        <Providers>
                            {children}
                        </Providers>
                    </ReactQueryProvider>
                </AppRouterCacheProvider>
            </body>
        </html>
    );
}
