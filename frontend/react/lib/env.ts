export const apiBase = (() => {
    const host = process.env.NEXT_PUBLIC_API_HOST;
    const stage = process.env.NEXT_PUBLIC_API_STAGE;
    if (!host || !stage) return '';
    if (host.startsWith('http://') || host.startsWith('https://')) {
        return `${host}/${stage}`;
    }
    return `https://${host}/${stage}`;
})();
