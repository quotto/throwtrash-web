import * as common from "trash-common";
import dbadapter from "./dbadapter";
import Logger from "./logger";
const logger = new Logger("register");

export default async (event_body_str: string, firebaseAccountId: string) => {
    let event_body;
    try {
        event_body = JSON.parse(event_body_str);
        if (typeof(event_body.platform) === "undefined" || event_body.platform.length === 0) {
            logger.error({message: 'invalid parameter: platform', data: event_body});
            return { statusCode: 400 };
        }
    } catch (e: any) {
        logger.error(e);
        return { statusCode: 400 };
    }

    const id = common.generateUUID("-");
    logger.debug({message: 'publish user id: id'});
    const timestamp = new Date().getTime();
    const registeredItem = {
        id: id,
        description: JSON.stringify([]),
        platform: event_body.platform,
        mobile_signin_id: firebaseAccountId,
    };

    logger.info({message: 'register user', data:{registeredItem, timestamp: timestamp}});
    if (await dbadapter.insertTrashSchedule(registeredItem, timestamp)) {
        return { statusCode: 200, body: JSON.stringify({ id: id, timestamp: timestamp }) };
    } else {
        return { statusCode: 500 };
    }
};