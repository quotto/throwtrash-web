import dbadapter from '../../dbadapter';
import signup from '../../migration/signup';

jest.mock('../../dbadapter');

const mockGetTrashScheduleByUserId = jest.fn();
const mockUpdateTrashScheduleMobileSigninId = jest.fn();
dbadapter.getTrashScheduleByUserId = mockGetTrashScheduleByUserId;
dbadapter.updateTrashScheduleMobileSigninId = mockUpdateTrashScheduleMobileSigninId;

describe('signup', () => {
  const body = JSON.stringify({ user_id: 'valid-user-id' });
  const firebaseAccountId = 'firebase-account-id';

  it('should update mobile_signin_id for valid user_id', async () => {
    mockGetTrashScheduleByUserId.mockResolvedValue({ user_id: 'valid-user-id' });
    mockUpdateTrashScheduleMobileSigninId.mockResolvedValue(true);

    const result = await signup(body, firebaseAccountId);
    expect(result.statusCode).toBe(200);
    expect(mockUpdateTrashScheduleMobileSigninId).toBeCalledWith('valid-user-id', firebaseAccountId);
  });

  it('should return 404 for invalid user_id', async () => {
    mockGetTrashScheduleByUserId.mockResolvedValue(null);

    const result = await signup(body, firebaseAccountId);
    expect(result.statusCode).toBe(404);
  });

  it('should return 500 if update fails', async () => {
    mockGetTrashScheduleByUserId.mockResolvedValue({ user_id: 'valid-user-id' });
    mockUpdateTrashScheduleMobileSigninId.mockResolvedValue(false);

    const result = await signup(body, firebaseAccountId);
    expect(result.statusCode).toBe(500);
  });
});