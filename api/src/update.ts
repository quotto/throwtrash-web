import { APIGatewayProxyResultV2 } from "aws-lambda";
import * as  common from "trash-common";
import dbadapter from "./dbadapter";
import { TrashScheduleItem } from "./interface";
const logger = common.getLogger();

export default async (trashScheduleItem: TrashScheduleItem): Promise<APIGatewayProxyResultV2>=>{
    logger.info(`Update Data -> ${JSON.stringify(trashScheduleItem)}`);

    try {
        // データチェックの結果に問題がなければ登録する
        if (common.checkTrashes(JSON.parse(trashScheduleItem.description))) {
            const timestamp = new Date().getTime()
            logger.debug(`update trash schedule -> ${JSON.stringify(trashScheduleItem)}`);
            const currentTrashSchedule = await dbadapter.getTrashScheduleByUserId(trashScheduleItem.id);
            let updateResult = false;
            if(currentTrashSchedule?.shared_id) {
                // shared_idが設定されてい場合はTrashScheduleとSharedScheduleをトランザクション内で更新する
                updateResult = await dbadapter.transactionUpdateSchedule(currentTrashSchedule.shared_id, trashScheduleItem, timestamp);

            } else {
                updateResult = await dbadapter.putExistTrashSchedule(trashScheduleItem, timestamp);
            }
            if(updateResult) {
                return { statusCode: 200, body: JSON.stringify({ timestamp: timestamp } )};
            } else {
                return { statusCode: 500 }
            }
        } else {
            logger.error(`invalid trash schedule: ${trashScheduleItem.description}`);
            return {
                statusCode: 400
            }
        }
    } catch (err: any) {
        logger.error(err);
        return { statusCode: 400 }
    }
}