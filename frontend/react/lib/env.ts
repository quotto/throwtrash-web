export const apiBase = (() => {
    const host = process.env.NEXT_PUBLIC_API_HOST;
    const stage = process.env.NEXT_PUBLIC_API_STAGE;
    return host && stage ? `https://${host}/${stage}` : '';
})();
