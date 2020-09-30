const common = require("trash-common");
const logger = common.getLogger();
const property = require("./property");
const db = require("./dbadapter");

/**
 * 隔週スケジュールの開始日(start_dateの直前の日曜日)を求める 
 * @param {int} start_date : yyyy-mm-dd形式の文字列
 */
const calculateStartDate = (start_date) => {
    const start_dt = new Date(start_date);
    const sunday_dt = new Date(start_dt.getTime() - (24 * 60 * 60 * 1000 * start_dt.getUTCDay()));

    return `${sunday_dt.getUTCFullYear()}-${sunday_dt.getUTCMonth()+1}-${sunday_dt.getUTCDate()}`;
};

const adjustData = (input_data) => {
    let regist_data = [];
    try {
        input_data.forEach((trash)=>{
            let regist_trash = {
                type: trash.type
            };
            if(trash.type === "other") {
                regist_trash.trash_val = trash.trash_val;
            }

            let trash_schedules = [];
            trash.schedules.forEach((schedule)=>{
                let regist_schedule = {
                    type: schedule.type,
                    value: schedule.value
                };
                if(regist_schedule.type && regist_schedule.type != "none" && regist_schedule.value) {
                    if(regist_schedule.type === "evweek") {
                        const start_date = calculateStartDate(regist_schedule.value.start);
                        regist_schedule.value.start = start_date;
                    }
                    trash_schedules.push(regist_schedule);
                }
            });
            regist_trash.schedules = trash_schedules;
            regist_data.push(regist_trash);
        });
    } catch(err) {
        logger.error("adjust error:" + err);
    }
    return regist_data;
}

module.exports = async(body,session)=>{
    // 検証した登録データをセッションに格納
    if(body && session && session.state && session.client_id && session.redirect_uri) {
        logger.info(`Regist request from ${session.id}`);
        logger.debug("Regist Data:", JSON.stringify(body));

        const regist_data = adjustData(body.data);
        if (!common.checkTrashes(regist_data)) {
            logger.error(`platform: ${session.platform}`);
            return {
                statusCode: 400,
                body: "Bad Data"
            }
        }

        const item = {};
        if(session.userInfo) {
            item.signinId = session.userInfo.signinId;
            item.signinService = session.userInfo.signinService;
            if(session.userInfo.id) {
                item.id = session.userInfo.id;
            }
        }

        try {
            if(!item.id) {
                item.id = await db.publishId();
            }
            
            // データ登録
            item.description = JSON.stringify(regist_data, null, 2);
            item.platform  = session.platform;
            await db.putTrashSchedule(item, regist_data);

            // authorization codeを発行しid（access_tokenとセットで保存する,期限は5分）
            const authorizationCode = await db.putAuthorizationCode(item.id, session.client_id, session.redirect_uri, 300);

            // セッションを削除する
            await db.deleteSession(session.id);

            const redirect_url = `${session.redirect_uri}?state=${session.state}&code=${authorizationCode.code}`;
            logger.debug("redirect to amazon auhorize service:", redirect_url);
            return {
                statusCode: 200,
                body: redirect_url,
                headers: {
                    "Access-Control-Allow-Origin": property.URL_ACCOUNT_LINK,
                    "Access-Control-Allow-Credentials": true,
                    "Cache-Control": "no-store"
                }
            }
        } catch(err) {
            logger.error(err);
            return {
                statusCode: 500,
                body: "Registration Failed"
            }
        }
    } else {
        logger.error("invalid parameter"+
            JSON.stringify({body: body,session:session}));
        return {
            statusCode: 400,
            body: "Invalid Parameters"
        }
    }

}