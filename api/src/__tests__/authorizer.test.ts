import { APIGatewayProxyEvent, APIGatewayAuthorizerResult } from 'aws-lambda';
import * as admin from 'firebase-admin';
import dbadapter from '../dbadapter';
import { handler } from '../authorizer';

jest.mock('firebase-admin');
jest.mock('../dbadapter');

const mockVerifyIdToken = jest.fn();
const mockAuth = {
  verifyIdToken: mockVerifyIdToken,
  tenantManager: jest.fn(),
  projectConfigManager: jest.fn(),
  app: jest.fn(),
};
(admin as any).auth = jest.fn().mockReturnValue(mockAuth);

const mockGetTrashScheduleByUserId = jest.fn();
dbadapter.getTrashScheduleByUserId = mockGetTrashScheduleByUserId;

describe('authorizer', () => {
  const event: APIGatewayProxyEvent = {
    headers: {
      Authorization: 'Bearer valid-token',
      'X-TRASH-USERID': 'valid-user-id',
    },
    requestContext: {
      resourceId: 'arn:aws:execute-api:region:account-id:api-id/stage/GET/resource',
    },
    path: '/some-path',
    body: null,
    // ...other properties as needed
  } as any;

  it('should allow access for valid token and matching user_id', async () => {
    mockVerifyIdToken.mockResolvedValue({ uid: 'valid-signin-id' });
    mockGetTrashScheduleByUserId.mockResolvedValue({
      user_id: 'valid-user-id',
      mobile_signin_id: 'valid-signin-id',
    });

    const result: APIGatewayAuthorizerResult = await handler(event);
    expect(result.policyDocument.Statement[0].Effect).toBe('Allow');
  });

  it('should deny access for invalid token', async () => {
    mockVerifyIdToken.mockRejectedValue(new Error('Invalid token'));

    const result: APIGatewayAuthorizerResult = await handler(event);
    expect(result.policyDocument.Statement[0].Effect).toBe('Deny');
  });

  it('should deny access for non-matching user_id', async () => {
    mockVerifyIdToken.mockResolvedValue({ uid: 'valid-signin-id' });
    mockGetTrashScheduleByUserId.mockResolvedValue({
      user_id: 'valid-user-id',
      mobile_signin_id: 'different-signin-id',
    });

    const result: APIGatewayAuthorizerResult = await handler(event);
    expect(result.policyDocument.Statement[0].Effect).toBe('Deny');
  });

  it('should allow access for /migration/signup path', async () => {
    const migrationEvent = { ...event, path: '/migration/signup' };
    mockVerifyIdToken.mockResolvedValue({ uid: 'valid-user-id' });

    const result: APIGatewayAuthorizerResult = await handler(migrationEvent);
    expect(result.policyDocument.Statement[0].Effect).toBe('Allow');
  });

  it('should allow access for /register path', async () => {
    const registerEvent = { ...event, path: '/register' };
    mockVerifyIdToken.mockResolvedValue({ uid: 'valid-user-id' });

    const result: APIGatewayAuthorizerResult = await handler(registerEvent);
    expect(result.policyDocument.Statement[0].Effect).toBe('Allow');
  });
});