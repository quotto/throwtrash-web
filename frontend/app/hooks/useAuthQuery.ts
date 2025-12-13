"use client";

import { useQuery } from '@tanstack/react-query';

export const AUTH_QUERY_KEY = ['auth', 'session'];

export function useAuthQuery() {
    return useQuery({
        queryKey: AUTH_QUERY_KEY,
        queryFn: async () => {
            try {
                const res = await fetch('/api/user_info', { cache: 'no-store' });
                if (!res.ok) throw new Error('ng');
                const data = await res.json();
                return data;
            } catch {
                return null; // 未ログイン時はnullを返す
            }
        },
        staleTime: 5 * 60 * 1000,
        refetchOnMount: false
    });
}
