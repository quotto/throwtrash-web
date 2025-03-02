import deleteHandler from "../delete";
import dbadapter from "../dbadapter";
import * as admin from 'firebase-admin';

jest.mock('../dbadapter');
jest.mock('firebase-admin', () => {
    return {
        auth: jest.fn()
    };
});

describe('delete', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return 400 if X-TRASH-USERID header is missing', async () => {
        const event = {
            headers: {}
        } as any;

        const result = await deleteHandler(event, 'firebase-id-123');

        expect(result.statusCode).toBe(400);
        expect(JSON.parse(result.body).error).toBe('Missing user ID');
    });

    it('should delete user data and firebase account successfully', async () => {
        const mockDeleteTrashSchedule = dbadapter.deleteTrashScheduleByUserId as jest.Mock;
        mockDeleteTrashSchedule.mockResolvedValue(true);

        const mockDeleteFirebaseUser = jest.fn().mockResolvedValue(true);
        const mockAuth = jest.fn().mockReturnValue({
            deleteUser: mockDeleteFirebaseUser
        });
        (admin.auth as jest.Mock).mockImplementation(mockAuth);

        const event = {
            headers: {
                'X-TRASH-USERID': 'user-123'
            }
        } as any;

        const result = await deleteHandler(event, 'firebase-id-123');

        expect(mockDeleteTrashSchedule).toHaveBeenCalledWith('user-123');
        expect(mockDeleteFirebaseUser).toHaveBeenCalledWith('firebase-id-123');
        expect(result.statusCode).toBe(204);
    });

    it('should return 500 if database deletion fails', async () => {
        const mockDeleteTrashSchedule = dbadapter.deleteTrashScheduleByUserId as jest.Mock;
        mockDeleteTrashSchedule.mockResolvedValue(false);

        const event = {
            headers: {
                'X-TRASH-USERID': 'user-123'
            }
        } as any;

        const result = await deleteHandler(event, 'firebase-id-123');

        expect(result.statusCode).toBe(500);
        expect(JSON.parse(result.body).error).toBe('Failed to delete user data');
    });

    it('should return 500 if firebase deletion fails', async () => {
        const mockDeleteTrashSchedule = dbadapter.deleteTrashScheduleByUserId as jest.Mock;
        mockDeleteTrashSchedule.mockResolvedValue(true);

        const mockDeleteFirebaseUser = jest.fn().mockRejectedValue(new Error('Firebase deletion error'));
        const mockAuth = jest.fn().mockReturnValue({
            deleteUser: mockDeleteFirebaseUser
        });
        (admin.auth as jest.Mock).mockImplementation(mockAuth);

        const event = {
            headers: {
                'X-TRASH-USERID': 'user-123'
            }
        } as any;

        const result = await deleteHandler(event, 'firebase-id-123');

        expect(result.statusCode).toBe(500);
        expect(JSON.parse(result.body).error).toBe('Internal server error during deletion');
    });
});