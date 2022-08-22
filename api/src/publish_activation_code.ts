import property from "./property";
import * as common from "trash-common";
import dbadapter from './dbadapter';
import { APIGatewayProxyEventQueryStringParameters, APIGatewayProxyResultV2 } from 'aws-lambda';
const logger = common.getLogger();

const generateActivationCode = (): string=>{
    const code = [];
    for (let i = 0; i < 10; i++) {
        code.push(Math.random() * 9 | 0);
    }
    const activation_code = code.join("");
    return activation_code;
}

export default async(params: APIGatewayProxyEventQueryStringParameters): Promise<APIGatewayProxyResultV2>=>{
    logger.debug(`publish activation code params: ${JSON.stringify(params)}`);

    if(params.user_id) {
        const trashScheduleItem = await dbadapter.getTrashScheduleByUserId(params.user_id);
        if (trashScheduleItem != null) {
            let limit = 0;
            while(limit < 5) {
                const code = generateActivationCode();
                logger.debug(`publish activation code -> ${code}`);
                const ttl = Math.ceil(new Date().getTime() / 1000 + property.ACTIVATION_CODE_EXPIRE_SECONDS);
                if (await dbadapter.putActivationCode({
                    code: code,
                    user_id: params.user_id,
                    TTL: ttl
                })) {
                    return { statusCode: 200, body: JSON.stringify({ code: code }) };
                }
                limit++;
            }
            logger.error("failed publish activation code, over limit");
            return {
                statusCode: 500
            }
        } else {
            logger.error(`user id not found: ${params.user_id}`);
            return {
                statusCode: 400
            };
        }
    }
    logger.error("parameters not contains user_id");
    return {
        statusCode: 400
    };
}