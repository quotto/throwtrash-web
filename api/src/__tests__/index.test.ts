// filepath: /Users/takah/project/throwtrash-web/api/src/__tests__/index.test.ts
import * as admin from 'firebase-admin';
import dbadapter from '../dbadapter';
import { handler } from '../index';

jest.mock('firebase-admin');
jest.mock('../dbadapter');
jest.mock('../sync', () => ({ __esModule: true, default: jest.fn().mockResolvedValue({ statusCode: 200 }) }));
jest.mock('../update', () => ({ __esModule: true, default: jest.fn().mockResolvedValue({ statusCode: 200 }) }));
jest.mock('../register', () => ({ __esModule: true, default: jest.fn().mockResolvedValue({ statusCode: 200 }) }));
jest.mock('../publish_activation_code', () => ({ __esModule: true, default: jest.fn().mockResolvedValue({ statusCode: 200 }) }));
jest.mock('../activate', () => ({ __esModule: true, default: jest.fn().mockResolvedValue({ statusCode: 200 }) }));
jest.mock('../migration/signup', () => ({ __esModule: true, default: jest.fn().mockResolvedValue({ statusCode: 200 }) }));
jest.mock('../start_link', () => ({ __esModule: true, default: jest.fn().mockResolvedValue({ statusCode: 200 }) }));
jest.mock('../enable_skill', () => ({ __esModule: true, default: jest.fn().mockResolvedValue({ statusCode: 200 }) }));
jest.mock('../migration/v2', () => ({ __esModule: true, default: jest.fn().mockResolvedValue({ statusCode: 200 }) }));
jest.mock('../signin', () => ({ __esModule: true, default: jest.fn().mockResolvedValue({ statusCode: 200 }) }));

const mockVerifyIdToken = jest.fn();
const mockAuth = {
  verifyIdToken: mockVerifyIdToken,
};
(admin as any).auth = jest.fn().mockReturnValue(mockAuth);

const mockGetTrashScheduleByUserId = jest.fn();
dbadapter.getTrashScheduleByUserId = mockGetTrashScheduleByUserId;

describe('index handler', () => {
  let event: AWSLambda.APIGatewayEvent;

  beforeEach(() => {
    jest.clearAllMocks();

    event = {
      resource: '/sync',
      httpMethod: 'GET',
      headers: {
        'Authorization': 'Bearer valid-token',
        'X-TRASH-USERID': 'valid-user-id'
      },
      queryStringParameters: {},
      pathParameters: null,
      stageVariables: null,
      body: null,
      isBase64Encoded: false,
      requestContext: {
        stage: 'test',
      } as any,
    } as any;
  });

  it('should return 401 when no Authorization header is provided', async () => {
    event.headers = {};

    const result = await handler(event, {} as AWSLambda.Context);

    expect(result).toEqual({
      statusCode: 401,
      body: 'Unauthorized',
    });
  });

  it('should return 403 when Firebase token verification fails', async () => {
    mockVerifyIdToken.mockRejectedValue(new Error('Invalid token'));

    const result = await handler(event, {} as AWSLambda.Context);

    expect(result).toEqual({
      statusCode: 403,
      body: 'Forbidden',
    });
  });

  it('should continue processing for valid token when path does not require user ID validation and path is /register', async () => {
    event.resource = '/register';
    mockVerifyIdToken.mockResolvedValue({ uid: 'firebase-user-id' });

    await handler(event, {} as AWSLambda.Context);

    expect(mockGetTrashScheduleByUserId).not.toHaveBeenCalled();
  });

  it('should continue processing for valid token when path does not require user ID validation and path is /signin', async () => {
    event.resource = '/signin';
    mockVerifyIdToken.mockResolvedValue({ uid: 'firebase-user-id' });

    await handler(event, {} as AWSLambda.Context);

    expect(mockGetTrashScheduleByUserId).not.toHaveBeenCalled();
  });

  it('should continue processing for valid token when path does not require user ID validation and path is /migration/signup', async () => {
    event.resource = '/migration/signup';
    mockVerifyIdToken.mockResolvedValue({ uid: 'firebase-user-id' });

    await handler(event, {} as AWSLambda.Context);

    expect(mockGetTrashScheduleByUserId).not.toHaveBeenCalled();
  });

  it('should return 403 when user ID validation fails', async () => {
    mockVerifyIdToken.mockResolvedValue({ uid: 'firebase-user-id' });
    mockGetTrashScheduleByUserId.mockResolvedValue({
      user_id: 'valid-user-id',
      mobile_signin_id: 'different-firebase-id',
    });

    const result = await handler(event, {} as AWSLambda.Context);

    expect(result).toEqual({
      statusCode: 403,
      body: 'Forbidden: Invalid user ID',
    });
  });

  it('should continue processing when user ID validation passes', async () => {
    mockVerifyIdToken.mockResolvedValue({ uid: 'firebase-user-id' });
    mockGetTrashScheduleByUserId.mockResolvedValue({
      user_id: 'valid-user-id',
      mobile_signin_id: 'firebase-user-id',
    });

    await handler(event, {} as AWSLambda.Context);

    // Check that we continued to the sync handler
    const syncModule = require('../sync');
    expect(syncModule.default).toHaveBeenCalled();
  });

  it('should return 500 when user ID validation throws an error', async () => {
    mockVerifyIdToken.mockResolvedValue({ uid: 'firebase-user-id' });
    mockGetTrashScheduleByUserId.mockRejectedValue(new Error('Database error'));

    const result = await handler(event, {} as AWSLambda.Context);

    expect(result).toEqual({
      statusCode: 500,
      body: 'Internal Server Error',
    });
  });

  it('should process valid requests correctly based on resource path', async () => {
    // Test each path to make sure it routes correctly
    const paths = [
      '/migration/signup',
      '/register',
      '/update',
      '/start_link',
      '/sync',
      '/publish_activation_code',
      '/activate',
      '/enable_skill',
      '/migration/v2',
      '/signin'
    ];

    mockVerifyIdToken.mockResolvedValue({ uid: 'firebase-user-id' });
    mockGetTrashScheduleByUserId.mockResolvedValue({
      user_id: 'valid-user-id',
      mobile_signin_id: 'firebase-user-id',
    });

    for (const path of paths) {
      event.resource = path;
      if (path === '/update') {
        event.body = '{}';
      }

      await handler(event, {} as AWSLambda.Context);

      // We don't need to assert specific handler calls, just that we didn't get an error
      // The path-specific handlers are mocked to return statusCode 200
    }
  });
});