const AWS = require("aws-sdk");
const property = require("./property.js");
const sync  = require("./sync.js");
const log4js = require("log4js");
const logger = log4js.getLogger();
module.exports = async(params)=>{
    const documentClient = new AWS.DynamoDB.DocumentClient({region: process.env.DB_REGION});
    try {
        const resultGet = await documentClient.get({
            TableName: property.ACTIVATE_TABLE_NAME,
            Key: {
                code: params.code
            }
        }).promise();
        logger.debug(`Get Activation Code -> ${JSON.stringify(resultGet)}`);
        if(resultGet.Item) {
            const syncResult = sync({id: resultGet.Item.user_id});
            // 使い終わったActivationCodeを削除する
            const deleteResult= documentClient.delete({
                TableName: property.ACTIVATE_TABLE_NAME,
                Key: {
                    code: params.code
                }
            }).promise();
            const response = await Promise.all([syncResult,deleteResult]);
            logger.debug(JSON.stringify(response));
            return response[0];
        } else {
            throw new Error(`Activation Code Not Found: ${params.code}`)
        }
    }catch(err) {
        logger.error(err);
        return {statusCode: 400}
    }
}