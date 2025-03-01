import { APIGatewayAuthorizerResult, APIGatewayRequestAuthorizerEvent } from 'aws-lambda';
import * as admin from 'firebase-admin';
import { handler } from '../authorizer';

jest.mock('firebase-admin');

const mockVerifyIdToken = jest.fn();
const mockAuth = {
  verifyIdToken: mockVerifyIdToken,
  tenantManager: jest.fn(),
  projectConfigManager: jest.fn(),
};

(admin as any).auth = jest.fn().mockReturnValue(mockAuth);

describe('authorizer', () => {
  let event: APIGatewayRequestAuthorizerEvent;

  beforeEach(() => {
    event = {
      methodArn: 'arn:aws:execute-api:region:account-id:api-id/stage/GET/resource',
      headers: {
        Authorization: 'Bearer valid-token'
      },
      requestContext: {
        resourceId: 'arn:aws:execute-api:region:account-id:api-id/stage/GET/resource',
      },
      resource: '/some-path',
      body: null,
    } as any;
  });

  it('should allow access for valid token', async () => {
    mockVerifyIdToken.mockResolvedValue({ uid: 'valid-signin-id' });
    
    const result: APIGatewayAuthorizerResult = await handler(event);
    
    expect(result.policyDocument.Statement[0].Effect).toBe('Allow');
    expect(result.principalId).toBe('valid-signin-id');
  });

  it('should deny access for invalid token', async () => {
    mockVerifyIdToken.mockRejectedValue(new Error('Invalid token'));
    
    const result: APIGatewayAuthorizerResult = await handler(event);
    
    expect(result.policyDocument.Statement[0].Effect).toBe('Deny');
  });

  it('should deny access when no token is provided', async () => {
    event.headers = {};
    
    const result: APIGatewayAuthorizerResult = await handler(event);
    
    expect(result.policyDocument.Statement[0].Effect).toBe('Deny');
  });
});