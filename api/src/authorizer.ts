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
  // Convert specific resource to a wildcard that covers the entire API
  // Format of methodArn: arn:aws:execute-api:region:account-id:api-id/stage/HTTP-VERB/resource-path
  // Replace the specific path with a wildcard, removing the HTTP verb as well
  const arnParts = resource.split('/');
  // Keep only up to the stage part (index 2) and add wildcard
  const baseArn = arnParts.slice(0, 2).join('/');
  const wildcardResource = `${baseArn}/*`;

  return {
    principalId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: wildcardResource,
        },
      ],
    },
  };
};
