import { APIGatewayProxyEventQueryStringParameters, APIGatewayProxyResultV2 } from "aws-lambda";
import dbadapter from "./dbadapter";
import Logger from './logger';

const logger = new Logger('activate');

export default async(params: APIGatewayProxyEventQueryStringParameters): Promise<APIGatewayProxyResultV2> => {
    if(params.code && params.user_id) {
        const activationCode = await dbadapter.getActivationCode(params.code);
        if(activationCode) {
            logger.debug({ message: 'receive activation Code', data: activationCode, method: 'activate' });
            if(!await dbadapter.setSharedIdToTrashSchedule(params.user_id, activationCode.shared_id)) {
                return {
                    statusCode: 500
                }
            }
            logger.info({ message: `set shared_id ${activationCode.shared_id} to user_id ${params.user_id}`, method: 'activate' });
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
            logger.debug({ message: 'update and delete result', data: response, method: 'activate' });
            if(response[0]) {
                return {
                    statusCode: 200,
                    body: JSON.stringify({
                        description: sharedSchedule.description,
                        timestamp: sharedSchedule.timestamp
                    })
                };
            } else {
                return {
                    statusCode: 500
                }
            }
        } else {
            logger.error({ message: `Activation Code Not Found: ${params.code}`, method: 'activate' });
            return {
                statusCode: 400
            }
        }
    }
    logger.error({ message: 'parameters not contains code', method: 'activate' });
    return {
        statusCode: 400
    }
}