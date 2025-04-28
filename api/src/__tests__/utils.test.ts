import { extractHeaderValue } from '../utils';
describe('utils', () => {
  describe('extractHeaderValue', () => {
    it('should return the value of the header with UpperCase and UpperCase', () => {
      const headers = {
        'X-TRASH-USERID': 'valid-user-id',
      };
      const result = extractHeaderValue(headers, 'X-TRASH-USERID');
      expect(result).toBe('valid-user-id');
    });
    it('should return the value of the header with lowerCase and lowerCase', () => {
      const headers = {
        'x-trash-userid': 'valid-user-id',
      };
      const result = extractHeaderValue(headers, 'x-trash-userid');
      expect(result).toBe('valid-user-id');
    });
    it('should return the value of the header with UpperCase and lowerCase', () => {
      const headers = {
        'X-TRASH-USERID': 'valid-user-id',
      };
      const result = extractHeaderValue(headers, 'x-trash-userid');
      expect(result).toBe('valid-user-id');
    });
    it('should return the value of the header with lowerCase and UpperCase', () => {
      const headers = {
        'x-trash-userid': 'valid-user-id',
      };
      const result = extractHeaderValue(headers, 'X-TRASH-USERID');
      expect(result).toBe('valid-user-id');
    });
    it('should return undefined for a non-existing header', () => {
      const headers = {
        'X-TRASH-USERID': 'valid-user-id',
      };
      const result = extractHeaderValue(headers, 'NON-EXISTING-HEADER');
      expect(result).toBeUndefined();
    });
    it('should return undefined for an empty header', () => {
      const headers = {};
      const result = extractHeaderValue(headers, 'X-TRASH-USERID');
      expect(result).toBeUndefined();
    });
  });
});