const common = require("trash-common");
const property = require("./property");
const db = require("./dbadapter");

/**
 * 隔週スケジュールの開始日（今週の日曜日 または 来週の日曜日）を求める 
 * @param {int} weektype : 0:今週,1:来週
 * @param {int} offset : ユーザー地域のタイムゾーンオフセット
 */
const calculateStartDate = (weektype, offset) => {
    const localdt = new Date(Date.now() + (-1 * offset * 60 * 1000));
    localdt.setUTCDate(localdt.getUTCDate() - localdt.getUTCDay() + (7 * weektype));

    return `${localdt.getUTCFullYear()}-${localdt.getUTCMonth()+1}-${localdt.getUTCDate()}`;
};

const adjustData = (input_data, offset) => {
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
                        const weektype = regist_schedule.value.start==="thisweek" ? 0 : 1;
                        const start_date = calculateStartDate(weektype, offset);
                        regist_schedule.value.start = start_date;
                    }
                    trash_schedules.push(regist_schedule);
                }
            });
            regist_trash.schedules = trash_schedules;
            regist_data.push(regist_trash);
        });
    } catch(err) {
        console.error("adjust error:" + err);
    }
    return regist_data;
}

module.exports = async(body,session)=>{
    // 検証した登録データをセッションに格納
    if(body && session && session.state && session.client_id && session.redirect_uri) {
        console.info(`Regist request from ${session.id}`);
        console.debug("Regist Data:", JSON.stringify(body));

        const regist_data = adjustData(body.data, body.offset);
        if (!common.checkTrashes(regist_data)) {
            console.error(`platform: ${session.platform}`);
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
            console.debug("redirect to amazon auhorize service:", redirect_url);
            return {
                statusCode: 200,
                body: redirect_url,
                headers: {
                    "Access-Control-Allow-Origin": property.URL_ACCOUNT_LINK,
                    "Access-Control-Allow-Credentials": true
                }
            }
        } catch(err) {
            console.error(err);
            return {
                statusCode: 500,
                body: "Registration Failed"
            }
        }
    } else {
        console.error("invalid parameter"+
            JSON.stringify({body: body,session:session}));
        return {
            statusCode: 400,
            body: "Invalid Parameters"
        }
    }

}