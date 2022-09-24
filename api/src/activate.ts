import sync from "./sync";
import * as common from "trash-common";
import { APIGatewayProxyEventQueryStringParameters, APIGatewayProxyResultV2 } from "aws-lambda";
import dbadapter from "./dbadapter";
const logger = common.getLogger();
export default async(params: APIGatewayProxyEventQueryStringParameters): Promise<APIGatewayProxyResultV2>=>{
    if(params.code && params.user_id) {
        const activationCode = await dbadapter.getActivationCode(params.code);
        if(activationCode) {
            if(!await dbadapter.setSharedIdToTrashSchedule(params.user_id, activationCode.shared_id)) {
                return {
                    statusCode: 500
                }
            }
            logger.debug(`Get Activation Code -> ${JSON.stringify(activationCode)}`);
            const sharedSchedule = await dbadapter.getSharedScheduleBySharedId(activationCode.shared_id);
            if(sharedSchedule === null) {
                return {
                    statusCode: 500
                }
            }
            const updateTrashScheduleResult = dbadapter.updateTrashSchedule(params.user_id, sharedSchedule.description, sharedSchedule.timestamp);
            // 使い終わったActivationCodeを削除する
            const deleteResult = dbadapter.deleteActivationCode(activationCode.code);
            const response = await Promise.all([updateTrashScheduleResult, deleteResult]);
            logger.debug(JSON.stringify(response));

            if(response[0]) {
                return {
                    statusCode: 200,
                    body: JSON.stringify({
                        description: sharedSchedule.description
                    })
                };
            } else {
                return {
                    statusCode: 500
                }
            }
        } else {
            logger.error(`Activation Code Not Found: ${params.code}`)
            return {
                statusCode: 400
            }
        }
    }
    logger.error("parameters not contains code");
    return {
        statusCode: 400
    }
}