import { APIGatewayAuthorizerResult, APIGatewayRequestAuthorizerEvent } from 'aws-lambda';
import * as admin from 'firebase-admin';
import Logger from './logger';

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

const logger = new Logger('authorizer');

export const handler = async (event: APIGatewayRequestAuthorizerEvent): Promise<APIGatewayAuthorizerResult> => {
  logger.debug({ message: 'Event received', data: event, method: 'handler' });
  const token = event.headers?.Authorization || event.headers?.authorization;
  const methodArn = event.methodArn;

  if (!token) {
    logger.error({ message: 'Unauthorized: token is missing', method: 'handler' });
    return generatePolicy('user', 'Deny', methodArn);
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const signinId = decodedToken.uid;
    
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
