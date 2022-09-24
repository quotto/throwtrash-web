import * as common from "trash-common";
import dbadapter from "./dbadapter";
import { TrashScheduleItem } from "./interface";
import { APIGatewayProxyEventQueryStringParameters, APIGatewayProxyResultV2 } from "aws-lambda";
import update from "./update";
const logger = common.getLogger();
export default async(params: APIGatewayProxyEventQueryStringParameters): Promise<APIGatewayProxyResultV2>=> {
    logger.debug(`sync parameters: ${JSON.stringify(params)}`);
    if(params.user_id) {
        const trashScheduleItem: TrashScheduleItem | null = await dbadapter.getTrashScheduleByUserId(params.user_id);
        logger.debug(`Response trash schedule -> ${JSON.stringify(trashScheduleItem)}`);
        if (trashScheduleItem != null) {
            if(trashScheduleItem.shared_id) {
                const sharedSchedule = await dbadapter.getSharedScheduleBySharedId(trashScheduleItem.shared_id);
                if(sharedSchedule === null) {
                    return {
                        statusCode: 500
                    }
                }

                let syncResult = true;
                if(typeof(trashScheduleItem.timestamp) === "undefined" || sharedSchedule?.timestamp >= trashScheduleItem.timestamp) {
                    logger.debug("sync SharedSchedule to TrashSchedule");
                    trashScheduleItem.description = sharedSchedule?.description;
                    trashScheduleItem.timestamp = sharedSchedule.timestamp;

                    syncResult = await dbadapter.putExistTrashSchedule(trashScheduleItem, sharedSchedule.timestamp);
                } else {
                    logger.debug("sync TrashSchedule to SharedSchedule ");
                    syncResult = await dbadapter.putSharedSchedule(sharedSchedule.shared_id, trashScheduleItem);
                }
                if(!syncResult) {
                    logger.error("failed sync TrashScedule, SharedSchedule");
                    return {
                        statusCode: 500
                    }
                }
            }
            return { statusCode: 200, body: JSON.stringify(trashScheduleItem) };
        } else {
            logger.error(`id not found: ${params.user_id}`);
            return {
                statusCode: 400
            };
        }
    }
    return {
        statusCode: 400
    };
}