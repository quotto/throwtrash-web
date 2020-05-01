const AWS = require("aws-sdk");
const property = require("./property.js");
const log4js = require("log4js");
const logger = log4js.getLogger();

module.exports = async(params)=> {
   logger.debug(params);
   const documentCLient = new AWS.DynamoDB.DocumentClient({region: process.env.DB_REGION});
    try {
        const result = await documentCLient.get({
            TableName: property.TRASH_SCHEDULE_TABLE_NAME,
            Key: {
                id: params.id
            }
        }).promise();
        logger.debug(`Get Schedule -> ${JSON.stringify(result)}`);
        if(result.Item) {
            return {statusCode: 200, body: JSON.stringify(result.Item)};
        } else {
            throw new Error(`Id Not Found: ${params.id}`)
        }
    } catch(err) {
        logger.error(err);
        return {statusCode: 400}
    }
}