const AWS = require("aws-sdk");
const common = require("trash-common");
const property = require("./property.js");

module.exports = async(data)=> {
    const documentClient = new AWS.DynamoDB.DocumentClient({region:process.env.DB_REGION});

    try {
        const id = common.generateId("-");

        // dataフォーマットチェックに成功したら登録する
        if(common.checkTrashes(JSON.parse(data.description))) {
            const dataParams = {
                id: id,
                platform: data.platform,
                description: data.description,
                timestamp: new Date().getTime()
            }

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
        console.error(err);
        return {statusCode:400};
    }
}