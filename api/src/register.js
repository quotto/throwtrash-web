const AWS = require("aws-sdk");
const common = require("trash-common");
const property = require("./property.js");
const log4js = require("log4js");
const logger = log4js.getLogger();

module.exports = async(data)=> {
    logger.info(`Register Data -> ${JSON.stringify(data)}`);
    const documentClient = new AWS.DynamoDB.DocumentClient({region:process.env.DB_REGION});

    try {
        const id = common.generateUUID("-");
        logger.debug(`Get Id -> ${id}`)

        // dataフォーマットチェックに成功したら登録する
        if(common.checkTrashes(JSON.parse(data.description))) {
            const dataParams = {
                id: id,
                platform: data.platform,
                description: data.description,
                timestamp: new Date().getTime()
            }
            logger.debug(`Put New Item -> ${JSON.stringify(dataParams)}`)

            await documentClient.put({
                TableName: property.TRASH_SCHEDULE_TABLE_NAME,
                Item: dataParams,
                ConditionExpression: "attribute_not_exists(id)"
            }).promise();

            return {statusCode:200, body: JSON.stringify({id: id, timestamp: dataParams.timestamp})};
        } else {
            throw new Error(`Invalid Data: ${data.description}`);
        }
    } catch(err) {
        logger.error(err);
        return {statusCode:400};
    }
}