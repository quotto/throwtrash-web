const AWS = require("aws-sdk");
const property = require("./property.js");
const sync  = require("./sync.js");
module.exports = async(params)=>{
    const documentClient = new AWS.DynamoDB.DocumentClient({region: process.env.DB_REGION});
    try {
        const result = await documentClient.get({
            TableName: property.ACTIVATE_TABLE_NAME,
            Key: {
                code: params.code
            }
        }).promise();
        if(result.Item) {
            const response = await sync({id: result.Item.user_id});
            return response;
        } else {
            throw new Error(`Activation Code Not Found: ${params.code}`)
        }
    }catch(err) {
        console.error(err);
        return {statusCode: 400}
    }
}