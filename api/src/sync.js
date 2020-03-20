const AWS = require("aws-sdk");
const property = require("./property.js");
module.exports = async(params)=> {
   const documentCLient = new AWS.DynamoDB.DocumentClient({region: process.env.DB_REGION});
    try {
        const result = await documentCLient.get({
            TableName: property.TRASH_SCHEDULE_TABLE_NAME,
            Key: {
                id: params.id
            }
        }).promise();
        if(result.Item) {
            return {statusCode: 200, body: JSON.stringify(result.Item)};
        } else {
            throw new Error(`Id Not Found: ${params.id}`)
        }
    } catch(err) {
        console.error(err);
        return {statusCode: 400}
    }
}