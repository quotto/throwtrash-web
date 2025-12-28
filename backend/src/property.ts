const normalizeHost = (host: string): string => {
    if (host.startsWith("http://") || host.startsWith("https://")) {
        return host;
    }
    return `https://${host}`;
};

const FRONT_END_HOST = normalizeHost(process.env.FRONT_END_HOST || "accountlink.mythrowaway.net");

export default {
    SESSION_TABLE: "throwtrash-backend-session",
    SCHEDULE_TABLE: "TrashSchedule",
    AUTHORIZE_TABLE: "throwtrash-backend-authorization",
    TOKEN_TABLE: "throwtrash-backend-accesstoken",
    REFRESH_TABLE: "throwtrash-backend-refreshtoken",
    URL_ACCOUNT_LINK: FRONT_END_HOST,
    SESSIONID_NAME:"throwaway-session",
    SESSION_MAX_AGE: 3600 // 60分 * 60秒
}
