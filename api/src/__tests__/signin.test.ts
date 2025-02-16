import signin from '../signin';
import dbadapter from '../dbadapter';
import * as admin from 'firebase-admin';

jest.mock('../dbadapter');
jest.mock('firebase-admin');

const mockVerifyIdToken = jest.fn();
const mockAuth = {
  verifyIdToken: mockVerifyIdToken,
  tenantManager: jest.fn(),
  projectConfigManager: jest.fn(),
  app: jest.fn(),
};
(admin as any).auth = jest.fn().mockReturnValue(mockAuth);

describe('signin', () => {
    const event = {
        headers: {
            Authorization: 'Bearer valid-token',
        },
    };

    it('should return 401 if no token is provided', async () => {
        const result = await signin({ headers: {} } as any);
        expect(result.statusCode).toBe(401);
        expect(result.body).toBe('Unauthorized');
    });

    it('should return 403 if token verification fails', async () => {
        mockVerifyIdToken.mockRejectedValue(new Error('Invalid token'));
        const result = await signin(event as any);
        expect(result.statusCode).toBe(403);
        expect(result.body).toBe('Forbidden');
    });

    it('should return 404 if user ID is not found', async () => {
        mockVerifyIdToken.mockResolvedValue({ uid: 'firebase-account-id' });
        dbadapter.getTrashScheduleUserIdByMobileSigninId = jest.fn().mockResolvedValue(null);
        const result = await signin(event as any);
        expect(result.statusCode).toBe(404);
        expect(result.body).toBe('User ID not found');
    });

    it('should return 200 and user ID if user is found', async () => {
        mockVerifyIdToken.mockResolvedValue({ uid: 'firebase-account-id' });
        dbadapter.getTrashScheduleUserIdByMobileSigninId = jest.fn().mockResolvedValue('user-id');
        const result = await signin(event as any);
        expect(result.statusCode).toBe(200);
        expect(result.body).toBe(JSON.stringify({ userId: 'user-id' }));
    });
});