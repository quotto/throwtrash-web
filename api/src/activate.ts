import sync from "./sync";
import * as common from "trash-common";
import { APIGatewayProxyEventQueryStringParameters, APIGatewayProxyResultV2 } from "aws-lambda";
import dbadapter from "./dbadapter";
const logger = common.getLogger();
export default async(params: APIGatewayProxyEventQueryStringParameters): Promise<APIGatewayProxyResultV2>=>{
    if(params.code) {
        const activationCode = await dbadapter.getActivationCode(params.code);
        if(activationCode) {
            logger.debug(`Get Activation Code -> ${JSON.stringify(activationCode)}`);
            const syncResult = sync({ user_id: activationCode.user_id });
            // 使い終わったActivationCodeを削除する
            const deleteResult = await dbadapter.deleteActivationCode(activationCode.code);
            const response = await Promise.all([syncResult, deleteResult]);
            logger.debug(JSON.stringify(response));
            return response[0];
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