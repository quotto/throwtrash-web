import { APIGatewayProxyEvent, APIGatewayAuthorizerResult } from 'aws-lambda';
import * as admin from 'firebase-admin';
import Logger from './logger';
import dbadapter from './dbadapter';

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

const logger = new Logger('authorizer');

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayAuthorizerResult> => {
  logger.debug({ message: 'Event received', data: event, method: 'handler' });
  const token = event.headers.Authorization || event.headers.authorization;
  const methodArn = event.requestContext.resourceId;
  const userId = event.headers['X-TRASH-USERID'];

  if (!token || !userId) {
    logger.error({ message: 'Unauthorized: token or userId is missing', method: 'handler' });
    return generatePolicy('user', 'Deny', methodArn);
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const signinId = decodedToken.uid;

    if (!['/migration/signup', '/register'].includes(event.path)) {
      const item = await dbadapter.getTrashScheduleByUserId(userId);

      if (!item || item.mobile_signin_id !== signinId) {
        logger.error({ message: 'match error', data: { expected: item?.mobile_signin_id, actual: signinId }, method: 'handler' });
        throw new Error('Unauthorized');
      }
    }

    return generatePolicy(signinId, 'Allow', methodArn);
  } catch (error: any) {
    logger.error({ message: 'Authorization error', data: error, method: 'handler' });
    return generatePolicy('user', 'Deny', methodArn);
  }
};

const generatePolicy = (principalId: string, effect: string, resource: string): APIGatewayAuthorizerResult => {
  return {
    principalId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: resource,
        },
      ],
    },
  };
};
