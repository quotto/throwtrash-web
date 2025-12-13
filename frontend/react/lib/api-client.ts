/* クライアント側で既存APIを呼び出すヘルパー（fetchベース） */
import { apiBase } from './env';

const jsonInit: RequestInit = {
    credentials: 'include',
    headers: {
        'Content-Type': 'application/json'
    }
};

export async function getUserInfo() {
    const res = await fetch(`/api/user_info`, { ...jsonInit, cache: 'no-store' });
    if (!res.ok) throw new Error('user_info failed');
    return res.json();
}

export async function signOut() {
    const res = await fetch(`/api/signout`, { ...jsonInit, cache: 'no-store' });
    if (!res.ok) throw new Error('signout failed');
    return true;
}

export async function submitTrashes(payload: { data: any; offset: number; nextdayflag: boolean }) {
    const res = await fetch(`/api/regist`, { ...jsonInit, method: 'POST', body: JSON.stringify(payload) });
    if (!res.ok) throw new Error('regist failed');
    return res.json();
}

export async function searchZipcode(zipcode: string) {
    const res = await fetch(`/api/search?zipcode=${zipcode}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('zipcode search failed');
    return res.json();
}

export async function loadAddress(address: string) {
    const res = await fetch(`/api/load?address=${encodeURIComponent(address)}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('zipcode load failed');
    return res.json();
}
