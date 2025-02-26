import { APIGatewayProxyResultV2 } from "aws-lambda";
import * as  common from "trash-common";
import dbadapter from "./dbadapter";
import { TrashScheduleItem, UpdateRequest } from "./interface";
const logger = common.getLogger();

export default async (updateRequest: UpdateRequest): Promise<APIGatewayProxyResultV2>=>{
    logger.info(`Update Data -> ${JSON.stringify(updateRequest)}`);
    try {
        // データチェックの結果に問題がなければ登録する
        if (common.checkTrashes(JSON.parse(updateRequest.description))) {
            const timestamp = new Date().getTime()
            logger.debug(`update trash schedule -> ${JSON.stringify(updateRequest)}`);
            const currentTrashSchedule = await dbadapter.getTrashScheduleByUserId(updateRequest.id);
            // リクエストパラメータのタイムスタンプと現在のDBタイムスタンプが一致しない場合はエラー
            if(currentTrashSchedule?.timestamp != updateRequest.timestamp) {
                logger.error(`invalid timestamp parameters: ${currentTrashSchedule?.timestamp}(remote) <-> ${updateRequest.timestamp}(params)`);
                return {
                    statusCode: 400,
                    body: JSON.stringify({
                        timestamp: currentTrashSchedule?.timestamp
                    })
                }
            }

            const updateTrashScheduleItem: TrashScheduleItem = {
               id: updateRequest.id,
               description: updateRequest.description,
               platform: updateRequest.platform,
               timestamp: currentTrashSchedule?.timestamp,
               shared_id: currentTrashSchedule?.shared_id,
               mobile_signin_id: currentTrashSchedule?.mobile_signin_id
            }

            let updateResult = false;
            if(currentTrashSchedule?.shared_id) {
                // shared_idが設定されてい場合はTrashScheduleとSharedScheduleをトランザクション内で更新する
                logger.info(`update shared schedule item-> shared_id:${currentTrashSchedule.shared_id}, schedule: ${JSON.stringify(updateTrashScheduleItem)}, timestamp: ${timestamp}`);
                updateResult = await dbadapter.transactionUpdateScheduleAndSharedSchedule(currentTrashSchedule.shared_id, updateTrashScheduleItem, timestamp);
            } else {
                logger.info(`update trash schedule item-> schedule: ${JSON.stringify(updateTrashScheduleItem)}, timestamp: ${timestamp}`);
                updateResult = await dbadapter.putExistTrashSchedule(updateTrashScheduleItem, timestamp);
            }
            if(updateResult) {
                return { statusCode: 200, body: JSON.stringify({ timestamp: timestamp } )};
            } else {
                return { statusCode: 500 }
            }
        } else {
            logger.error(`invalid trash schedule: ${updateRequest.description}`);
            return {
                statusCode: 400
            }
        }
    } catch (err: any) {
        logger.error(err);
        return { statusCode: 400 }
    }
}