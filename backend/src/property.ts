const normalizeHost = (host: string): string => {
    if (host.startsWith("http://") || host.startsWith("https://")) {
        return host;
    }
    return `https://${host}`;
};

const APP_URL = normalizeHost(process.env.APP_URL || "apps.mythrowaway.net");

export default {
    SESSION_TABLE: "throwtrash-backend-session",
    SCHEDULE_TABLE: "TrashSchedule",
    AUTHORIZE_TABLE: "throwtrash-backend-authorization",
    TOKEN_TABLE: "throwtrash-backend-accesstoken",
    REFRESH_TABLE: "throwtrash-backend-refreshtoken",
    URL_ACCOUNT_LINK: APP_URL,
    SESSIONID_NAME:"throwaway-session",
    SESSION_MAX_AGE: 3600 // 60分 * 60秒
}
