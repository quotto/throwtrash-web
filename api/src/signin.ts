import * as admin from 'firebase-admin';
import dbadapter from './dbadapter';

export default async function signin(event: AWSLambda.APIGatewayEvent) {
    const token = event.headers.Authorization || event.headers.authorization;
    if (!token) {
        return {
            statusCode: 401,
            body: 'Unauthorized',
        };
    }

    let firebaseAccountId;
    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        firebaseAccountId = decodedToken.uid;
    } catch (error) {
        console.error('Error verifying ID token', error);
        return {
            statusCode: 403,
            body: 'Forbidden',
        };
    }

    const user_id = await dbadapter.getTrashScheduleUserIdByMobileSigninId(firebaseAccountId);

    if (!user_id) {
        return {
            statusCode: 404,
            body: 'User ID not found',
        };
    }

    return {
        statusCode: 200,
        body: JSON.stringify({ userId: user_id }),
    };
}