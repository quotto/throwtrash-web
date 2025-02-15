import property from "./property";
import Logger from './logger';
const logger = new Logger('dbadapter');
import AWS from "aws-sdk";
const documentClient = new AWS.DynamoDB.DocumentClient();
import crypto from "crypto";
import {  AccountLinkItem, ActivationCodeItem, CodeItem, SharedScheduleItem, TrashScheduleItem } from "./interface";


const toHash = (value: string): string => {
    return crypto.createHash("sha512").update(value).digest("hex");
}

const SharedSchedulePutOperation = (shared_id: string, description: string, timestamp: number): AWS.DynamoDB.DocumentClient.Put => {
   return {
        TableName: property.SHARED_SCHEDULE_TABLE,
        Item: {
            shared_id: shared_id,
            description: description,
            timestamp: timestamp
        }
    }
}

const ExistTrashScheduleWithSharedIdPutOperation = (scheduleItem: TrashScheduleItem, timestamp: number, shared_id: string): AWS.DynamoDB.DocumentClient.Put => {
   return  {
        TableName: property.TRASH_SCHEDULE_TABLE,
        Item: {
            id: scheduleItem.id,
            description: scheduleItem.description,
            platform: scheduleItem.platform,
            mobile_signin_id: scheduleItem.mobile_signin_id,
            timestamp: timestamp,
            shared_id: shared_id
        },
        ConditionExpression: "attribute_exists(id)"
    }
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
        logger.error({ message: `account link item not found, token=${token}`, method: 'getAccountLinkItemByToken' });
        return null;
    }).catch(err => {
        logger.error({ message: err, method: 'getAccountLinkItemByToken' });
        return null;
    });
}

const putAccountLinkItem = async (accountLinkItem: AccountLinkItem): Promise<boolean> => {
    return documentClient.put({
        TableName: property.ACCOUNT_LINK_TABLE,
        Item: accountLinkItem
    }).promise().then(() => {
        logger.info({ message: 'put AccountLinkItem', data: accountLinkItem, method: 'putAccountLinkItem' });
        return true;
    }).catch(err => {
        logger.error({ message: err, method: 'putAccountLinkItem' });
        return false;
    });
}

const deleteAccountLinkItemByToken = async(token: string): Promise<boolean> => {
    return await documentClient.delete({
        TableName: property.ACCOUNT_LINK_TABLE,
        Key: {
            token: token
        }
    }).promise().then(_ => true).catch((e: any) => {
        logger.error({ message: e, method: 'deleteAccountLinkItemByToken' });
        return false;
    });
}

const getTrashScheduleByUserId = async (user_id: string): Promise<TrashScheduleItem | null> => {
    return documentClient.get({
        TableName: property.TRASH_SCHEDULE_TABLE,
        Key: {
            id: user_id
        }
    }).promise().then(item => {
        if(item.Item) {
            return {
                id: item.Item.id,
                description: item.Item.description,
                platform: item.Item.platform,
                timestamp: item.Item.timestamp,
                shared_id: item.Item.shared_id,
                mobile_signin_id: item.Item.mobile_signin_id
            }
        }
        logger.error({ message: `user id not found ${user_id}`, method: 'getTrashScheduleByUserId' });
        return null;
    }).catch((e: any) => {
        logger.error({ message: 'failed get trash schedule', data: e, method: 'getTrashScheduleByUserId' });
        return null;
    });
}

const setSharedIdToTrashSchedule = async(user_id: string, shared_id: string): Promise<boolean> => {
    return documentClient.update({
        TableName: property.TRASH_SCHEDULE_TABLE,
        Key: {
            id: user_id
        },
        UpdateExpression: 'set #shared_id = :shared_id',
        ExpressionAttributeNames: {'#shared_id': 'shared_id'},
        ExpressionAttributeValues: {':shared_id': shared_id}
    }).promise().then(_ => true).catch((err) => {
        logger.error({ message: 'failed update trash schedule', data: err, method: 'setSharedIdToTrashSchedule' });
        return false;
    })
}

const putSharedSchedule = async(shared_id: string, schedule: TrashScheduleItem): Promise<boolean> => {
    return documentClient.put({
        TableName: property.SHARED_SCHEDULE_TABLE,
        Item: {
            shared_id: shared_id,
            description: schedule.description,
            timestamp: schedule.timestamp
        }
    }).promise().then(_ => true).catch((err) => {
        logger.error({ message: 'failed put shared schedule', data: err, method: 'putSharedSchedule' });
        return false;
    });
}

const getSharedScheduleBySharedId = async(shared_id: string): Promise<SharedScheduleItem|null> => {
    return documentClient.get({
        TableName: property.SHARED_SCHEDULE_TABLE,
        Key: {
            shared_id: shared_id
        }
    }).promise().then((value) => {
        if(value.Item) {
            return {
                shared_id: value.Item.shared_id,
                description: value.Item.description,
                timestamp: value.Item.timestamp
            }
        }
        return null;
    }).catch((err) => {
        logger.error({ message: 'failed get shared schedule', data: err, method: 'getSharedScheduleBySharedId' });
        return null;
    });
}

const putActivationCode = async(activationCodeItem: ActivationCodeItem): Promise<boolean> => {
    return await documentClient.put({
        TableName: property.ACTIVATE_TABLE,
        Item: {
            code: activationCodeItem.code,
            shared_id: activationCodeItem.shared_id,
            TTL: activationCodeItem.TTL
        }
    }).promise().then(_ => true).catch(e => {
        logger.error({ message: 'failed put activation code', data: e, method: 'putActivationCode' });
        return false;
    });
}

const deleteActivationCode = async(code: string): Promise<boolean> => {
    return await documentClient.delete({
        TableName: property.ACTIVATE_TABLE,
        Key: {
            code: code
        }
    }).promise().then(_ => true).catch((e: any) => {
        logger.error({ message: 'failed delete activation code', data: e, method: 'deleteActivationCode' });
        return false;
    });
}

const getActivationCode = async(code: string): Promise<ActivationCodeItem | null> => {
    return await documentClient.get({
        TableName: property.ACTIVATE_TABLE,
        Key: {
            code: code
        }
    }).promise().then(item => {
        if(item.Item) {
            return {
                code: item.Item.code,
                shared_id: item.Item.shared_id,
                TTL: item.Item.TTL
            }
        }
        return null;
    }).catch((e: any) => {
        logger.error({ message: 'failed get activation code', data: e, method: 'getActivationCode' });
        return null;
    });
}

const insertTrashSchedule = async(trashScheduleItem: TrashScheduleItem, timestamp: number): Promise<boolean> => {
    return documentClient.put({
        TableName: property.TRASH_SCHEDULE_TABLE,
        Item: {
            ...trashScheduleItem,
            timestamp: timestamp
        },
        ConditionExpression: 'attribute_not_exists(id)'
    }).promise().then(_ => true).catch((e: any) => {
        logger.error({ message: e, method: 'insertTrashSchedule' });
        return false;
    });
}

const putExistTrashSchedule = async(trashScheduleItem: TrashScheduleItem, timestamp: number): Promise<boolean> => {
    return documentClient.put({
        TableName: property.TRASH_SCHEDULE_TABLE,
        Item: {
            id: trashScheduleItem.id,
            description: trashScheduleItem.description,
            platform: trashScheduleItem.platform,
            timestamp: timestamp,
            shared_id: trashScheduleItem.shared_id
        },
        ConditionExpression: 'attribute_exists(id)'
    }).promise().then(_ => true).catch((e: any) => {
        logger.error({ message: e, method: 'putExistTrashSchedule' });
        return false;
    });
}

const updateTrashSchedule = async(user_id: string, description: string, timestamp: number): Promise<boolean> => {
    return documentClient.update({
        TableName: property.TRASH_SCHEDULE_TABLE,
        Key: {
            id: user_id
        },
        UpdateExpression: 'set #description = :description, #timestamp = :timestamp',
        ExpressionAttributeNames: {
            '#description': 'description',
            '#timestamp': 'timestamp'
        },
        ExpressionAttributeValues: {
            ':description': description,
            ':timestamp': timestamp
        },
        ConditionExpression: 'attribute_exists(id)'
    }).promise().then(_ => true).catch((err) => {
        logger.error({ message: 'failed update trash schedule', data: err, method: 'updateTrashSchedule' });
        return false;
    });
}

const putAuthorizationCode = async(codeItem: CodeItem): Promise<boolean> => {
    return documentClient.put({
        TableName: property.AUTHORIZE_TABLE,
        Item: codeItem,
        ConditionExpression: 'attribute_not_exists(code)'
    }).promise().then(_ => true).catch(err => {
        logger.warn({ message: err, method: 'putAuthorizationCode' });
        return false;
    });
}

const transactionUpdateScheduleAndSharedSchedule = async(shared_id: string, scheduleItem: TrashScheduleItem, timestamp: number): Promise<boolean> => {
    return documentClient.transactWrite({
        TransactItems: [
            {
                Put: SharedSchedulePutOperation(shared_id, scheduleItem.description, timestamp),
            },
            {
                Put: ExistTrashScheduleWithSharedIdPutOperation(scheduleItem, timestamp, shared_id)
            }
        ]
    }).promise().then(_ => true).catch((err) => {
        logger.error({ message: 'failed transaction update schedule', data: err, method: 'transactionUpdateScheduleAndSharedSchedule' });
        return false;
    })
}

const updateTrashScheduleTimestamp = async(user_id: string, timestamp: number): Promise<boolean> => {
    return documentClient.update({
        TableName: property.TRASH_SCHEDULE_TABLE,
        Key: {
            id: user_id
        },
        UpdateExpression: 'set #timestamp = :timestamp',
        ExpressionAttributeNames: {
            '#timestamp': 'timestamp'
        },
        ExpressionAttributeValues: {
            ':timestamp': timestamp
        }
    }).promise().then(_ => true).catch(err => {
        logger.error({ message: 'failed update TrashSchedule timestamp', data: err, method: 'updateTrashScheduleTimestamp' });
        return false;
    });
}

const updateTrashScheduleMobileSigninId = async (user_id: string, mobile_signin_id: string): Promise<boolean> => {
    return documentClient.update({
        TableName: property.TRASH_SCHEDULE_TABLE,
        Key: { id: user_id },
        UpdateExpression: 'set #mobile_signin_id = :mobile_signin_id',
        ExpressionAttributeNames: { '#mobile_signin_id': 'mobile_signin_id' },
        ExpressionAttributeValues: { ':mobile_signin_id': mobile_signin_id }
    }).promise().then(_ => true).catch(err => {
        logger.error({ message: 'failed to update mobile_signin_id', data: err, method: 'updateTrashScheduleMobileSigninId' });
        return false;
    });
};

export default {
    putAccountLinkItem,
    getAccountLinkItemByToken,
    deleteAccountLinkItemByToken,
    getTrashScheduleByUserId,
    putActivationCode,
    deleteActivationCode,
    getActivationCode,
    insertTrashSchedule,
    putExistTrashSchedule,
    updateTrashSchedule,
    putAuthorizationCode,
    setSharedIdToTrashSchedule,
    putSharedSchedule,
    getSharedScheduleBySharedId,
    transactionUpdateScheduleAndSharedSchedule,
    updateTrashScheduleTimestamp,
    updateTrashScheduleMobileSigninId
};