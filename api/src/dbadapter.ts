import property from "./property";
import * as common from "trash-common";
const logger = common.getLogger();
import AWS, { Account, AWSError } from "aws-sdk";
const documentClient = new AWS.DynamoDB.DocumentClient({ region: process.env.DB_REGION });
import crypto from "crypto";
import {  AccountLinkItem, ActivationCodeItem, CodeItem, TrashScheduleItem } from "./interface";


const toHash = (value: string): string => {
    return crypto.createHash("sha512").update(value).digest("hex");
}


const getAccountLinkItemByToken = async (token: string): Promise<AccountLinkItem | null> => {
    return documentClient.get({
        TableName: property.ACCOUNT_LINK_TABLE,
        Key: {
            token: token
        }
    }).promise().then(item => {
        if(item.Item) {
            const resultItem : AccountLinkItem = {
                token: item.Item.token,
                user_id: item.Item.user_id,
                state: item.Item.state,
                redirect_url: item.Item.redirect_url,
                TTL: item.Item.TTL
            };
            return resultItem;
        }
        logger.error(`account link item not found, token=${token}`);
        return null;
    }).catch(err => {
        logger.error(err);
        return null;
    });
}

const putAccountLinkItem = async (accountLinkItem: AccountLinkItem): Promise<boolean> => {
    return documentClient.put({
        TableName: property.ACCOUNT_LINK_TABLE,
        Item: accountLinkItem
    }).promise().then(() => {
        logger.info("put AccountLinkItem: "+JSON.stringify(accountLinkItem));
        return true;
    }).catch(err => {
        logger.error(err);
        return false;
    });
}

const deleteAccountLinkItemByToken = async(token: string): Promise<boolean>=>{
    return await documentClient.delete({
        TableName: property.ACCOUNT_LINK_TABLE,
        Key:{
            token: token
        }
    }).promise().then(_=>{return true}).catch((e: any)=>{
        logger.error(e);
        return false;
    });
}

const getTrashScheduleByUserId = async (user_id: string): Promise<TrashScheduleItem&{timestamp: number} | null> => {
    return documentClient.get({
        TableName: property.TRASH_SCHEDULE_TABLE,
        Key: {
            id: user_id
        }
    }).promise().then(item=>{
        if(item.Item) {
            return {
                id: item.Item.id,
                description: item.Item.description,
                platform: item.Item.platform,
                timestamp: item.Item.timestamp
            }
        }
        logger.error(`user id not found ${user_id}`)
        return null;
    }).catch((e: any) => {
        logger.error("failed get trash schedule")
        logger.error(e);
        return null;
    });
}

const putActivationCode = async(activationCodeItem: ActivationCodeItem): Promise<boolean> => {
    return await documentClient.put({
        TableName: property.ACTIVATE_TABLE,
        Item: {
            code: activationCodeItem.code,
            user_id: activationCodeItem.user_id,
            TTL: activationCodeItem.TTL
        }
    }).promise().then(_=>{return true}).catch(e=>{
        logger.error("failed put activation code");
        return false;
    });
}

const deleteActivationCode = async(code: String): Promise<boolean> => {
    return await documentClient.delete({
        TableName: property.ACTIVATE_TABLE,
        Key: {
            code: code
        }
    }).promise().then(_=>{
        return true;
    }).catch((e: any)=>{
        logger.error("failed delete activation code");
        logger.error(e);
        return false;
    });
}

const getActivationCode = async(code: string): Promise<ActivationCodeItem | null>=> {
    return await documentClient.get({
        TableName: property.ACTIVATE_TABLE,
        Key: {
            code: code
        }
    }).promise().then(item=>{
        if(item.Item) {
            return {
                code: item.Item.code,
                user_id: item.Item.user_id,
                TTL: item.Item.TTL
            }
        }
        return null;
    }).catch((e: any)=>{
        logger.error("failed get activation code");
        logger.error(e);
        return null;
    });
}

const insertTrashSchedule = async(trashScheduleItem: TrashScheduleItem, timestamp: number): Promise<boolean> => {
    return documentClient.put({
        TableName: property.TRASH_SCHEDULE_TABLE,
        Item: {
            id: trashScheduleItem.id,
            description: trashScheduleItem.description,
            platform: trashScheduleItem.platform,
            timestamp: timestamp
        },
        ConditionExpression: "attribute_not_exists(id)"
    }).promise().then(_=>{return true}).catch((e: any)=>{
       logger.error(e);
       return false;
    });
}

const updateTrashSchdeule = async(trashScheduleItem: TrashScheduleItem, timestamp: number): Promise<boolean> => {
    return documentClient.put({
        TableName: property.TRASH_SCHEDULE_TABLE,
        Item: {
            id: trashScheduleItem.id,
            description: trashScheduleItem.description,
            platform: trashScheduleItem.platform,
            timestamp: timestamp
        },
        ConditionExpression: "attribute_exists(id)"
    }).promise().then(_=>{return true}).catch((e: any)=>{
       logger.error(e);
       return false;
    });
}

const putAuthorizationCode = async(codeItem: CodeItem): Promise<boolean> =>{
    return documentClient.put({
        TableName: property.AUTHORIZE_TABLE,
        Item: codeItem,
        ConditionExpression: "attribute_not_exists(code)"
    }).promise().then(_ => {
        return true;
    }).catch(err => {
        logger.warn(err);
        return false;
    });
}

export default {
    putAccountLinkItem: putAccountLinkItem,
    getAccountLinkItemByToken: getAccountLinkItemByToken,
    deleteAccountLinkItemByToken: deleteAccountLinkItemByToken,
    getTrashScheduleByUserId: getTrashScheduleByUserId,
    putActivationCode: putActivationCode,
    deleteActivationCode: deleteActivationCode,
    getActivationCode: getActivationCode,
    insertTrashSchedule: insertTrashSchedule,
    updateTrashSchdeule: updateTrashSchdeule,
    putAuthorizationCode: putAuthorizationCode,
}