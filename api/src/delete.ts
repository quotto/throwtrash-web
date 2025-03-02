import * as admin from 'firebase-admin';
import Logger from './logger';
import dbadapter from './dbadapter';

const logger = new Logger('delete');

export default async function(event: AWSLambda.APIGatewayEvent, firebaseAccountId: string) {
    logger.debug({ message: 'delete user request', data: { event, firebaseAccountId }, method: 'default' });

    const userId = event.headers['X-TRASH-USERID'];

    if (!userId) {
        logger.error({ message: 'X-TRASH-USERID が存在しません', method: 'default' });
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Missing user ID' })
        };
    }

    try {
        await admin.auth().deleteUser(firebaseAccountId);
        const deleteResult = await dbadapter.deleteTrashScheduleByUserId(userId);

        if (!deleteResult) {
            logger.error({ message: 'TrashScheduleの削除に失敗しました。', data: { userId }, method: 'default' });
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Failed to delete user data' })
            };
        }

        logger.info({
            message: 'ユーザー情報を削除しました。',
            data: { userId, firebaseAccountId },
            method: 'default'
        });


        return {
            statusCode: 204,
            body: ''
        };
    } catch (error) {
        logger.error({ message: 'ユーザー情報の削除で予期しないエラーが発生しました。', data: error, method: 'default' });
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error during deletion' })
        };
    }
}