const AWS = require("aws-sdk");
const common = require("trash-common");
const logger = common.getLogger();
const property = require("./property.js");

module.exports = async (data)=>{
    logger.info(`Update Data -> ${JSON.stringify(data)}`);
    const documentClient = new AWS.DynamoDB.DocumentClient({region: process.env.DB_REGION});

    try {
        // データチェックの結果に問題がなければ登録する
        if (common.checkTrashes(JSON.parse(data.description))) {

            const dataParams = {
                id: data.id,
                description: data.description,
                platform: data.platform,
                timestamp: new Date().getTime()
            }

            logger.debug(`Put Item -> ${JSON.stringify(dataParams)}`);
            await documentClient.put({
                TableName: property.TRASH_SCHEDULE_TABLE_NAME,
                Item: dataParams,
                ConditionExpression: "attribute_exists(id)"
            }).promise();

            return { statusCode: 200, body: JSON.stringify({ timestamp: dataParams.timestamp } )};
        } else {
            throw new Error(`Invalid Data: ${data.description}`);
        }
    } catch (err) {
        logger.error(err);
        return { statusCode: 400 }
    }
}