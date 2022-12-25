import { APIGatewayProxyResultV2, APIGatewayProxyEventQueryStringParameters } from "aws-lambda";
import * as  common from "trash-common";
import dbadapter from "./dbadapter";
import { RegisteredTrashScheduleItem } from "./interface";
const logger = common.getLogger();

export default async (params: APIGatewayProxyEventQueryStringParameters): Promise<APIGatewayProxyResultV2> => {
    if(typeof(params.platform) === "undefined" || params.platform === null || params.platform.length === 0) {
        logger.error(`invalid parameter: platform -> ${params.platform}`);
        return { statusCode: 400 };
    }
    const id = common.generateUUID("-");
    logger.debug(`publish user id -> ${id}`)

    const timestamp = new Date().getTime();
    const registeredItem = {
        id: id,
            description: JSON.stringify([]),
        platform: params.platform
    }

    logger.info(`register user: ${JSON.stringify(registeredItem)}, timestamp: ${timestamp}`);
    if (await dbadapter.insertTrashSchedule(registeredItem, timestamp)) {
        return { statusCode: 200, body: JSON.stringify({ id: id, timestamp: timestamp }) };
    } else {
        return { statusCode: 500 };
    }
}