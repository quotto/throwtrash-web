import * as common from "trash-common";
import dbadapter from "./dbadapter";
import { TrashScheduleItem } from "./interface";
import { APIGatewayProxyEventQueryStringParameters, APIGatewayProxyResultV2 } from "aws-lambda";
const logger = common.getLogger();
export default async(params: APIGatewayProxyEventQueryStringParameters): Promise<APIGatewayProxyResultV2>=> {
    logger.debug(`sync parameters: ${JSON.stringify(params)}`);
    if(params.user_id) {
        const trashScheduleItem: TrashScheduleItem | null = await dbadapter.getTrashScheduleByUserId(params.user_id);
        logger.debug(`Response trash schedule -> ${JSON.stringify(trashScheduleItem)}`);
        if (trashScheduleItem != null) {
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