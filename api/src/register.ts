import { APIGatewayProxyResultV2 } from "aws-lambda";
import * as  common from "trash-common";
import dbadapter from "./dbadapter";
import { RegisteredTrashScheduleItem } from "./interface";
const logger = common.getLogger();

export default async(trashScheduleItem: RegisteredTrashScheduleItem): Promise<APIGatewayProxyResultV2> => {
    logger.info(`Register Data -> ${JSON.stringify(trashScheduleItem)}`);

    try {
        const id = common.generateUUID("-");
        logger.debug(`publish user id -> ${id}`)

        // dataフォーマットチェックに成功したら登録する
        if(common.checkTrashes(JSON.parse(trashScheduleItem.description))) {
            const timestamp =  new Date().getTime();
            logger.debug(`put new item -> ${JSON.stringify(trashScheduleItem)}`)

            const registeredItem = {
                id: id,
                description: trashScheduleItem.description,
                platform: trashScheduleItem.platform
            }

            if(await dbadapter.insertTrashSchedule(registeredItem, timestamp)) {
                return {statusCode:200, body: JSON.stringify({id: id, timestamp: timestamp})};
            } else {
                return {statusCode: 500};
            }

        } else {
            logger.error(`validation failed: ${trashScheduleItem.description}`);
            return {
                statusCode: 400
            };
        }
    } catch(err: any) {
        logger.error(err);
        return {statusCode:400};
    }
}