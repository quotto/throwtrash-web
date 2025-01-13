export default {
    SESSION_TABLE: "throwtrash-backend-session",
    SCHEDULE_TABLE: "TrashSchedule",
    AUTHORIZE_TABLE: "throwtrash-backend-authorization",
    TOKEN_TABLE: "throwtrash-backend-accesstoken",
    REFRESH_TABLE: "throwtrash-backend-refreshtoken",
    URL_ACCOUNT_LINK: `https://${process.env.FRONT_END_HOST}`,
    SESSIONID_NAME:"throwaway-session",
    SESSION_MAX_AGE: 3600 // 60分 * 60秒
}