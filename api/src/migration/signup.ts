import dbadapter from '../dbadapter';

export default async function signup(body: string, firebaseAccountId: string) {
    const requestBody = JSON.parse(body);
    const { user_id } = requestBody;

    const item = await dbadapter.getTrashScheduleByUserId(user_id);

    if (!item) {
        return {
            statusCode: 404,
            body: 'User not found',
        };
    }

    item.mobile_signin_id = firebaseAccountId;

    const updateResult = await dbadapter.updateTrashScheduleMobileSigninId(user_id, firebaseAccountId);

    if (!updateResult) {
        return {
            statusCode: 500,
            body: 'Failed to update user',
        };
    }

    return {
        statusCode: 200,
        body: 'User updated successfully',
    };
}