import { encodeCursor, decodeCursor } from '../utils/cursor';
import { CursorPayload } from '../types';

describe('Cursor Utilities', () => {
  const validCursor: CursorPayload = {
    updated_at: '2024-03-20T14:45:00.000Z',
    id: '550e8400-e29b-41d4-a716-446655440000',
  };

  describe('encodeCursor', () => {
    it('should encode a cursor payload to a base64url string', () => {
      const encoded = encodeCursor(validCursor);
      expect(typeof encoded).toBe('string');
      expect(encoded.length).toBeGreaterThan(0);
      // base64url should not contain +, /, or = padding
      expect(encoded).not.toMatch(/[+/=]/);
    });

    it('should produce different encodings for different cursors', () => {
      const cursor1: CursorPayload = {
        updated_at: '2024-01-01T00:00:00.000Z',
        id: '550e8400-e29b-41d4-a716-446655440001',
      };
      const cursor2: CursorPayload = {
        updated_at: '2024-06-01T00:00:00.000Z',
        id: '550e8400-e29b-41d4-a716-446655440002',
      };
      expect(encodeCursor(cursor1)).not.toBe(encodeCursor(cursor2));
    });
  });

  describe('decodeCursor', () => {
    it('should round-trip: encode then decode returns original payload', () => {
      const encoded = encodeCursor(validCursor);
      const decoded = decodeCursor(encoded);
      expect(decoded).toEqual(validCursor);
    });

    it('should return null for an empty string', () => {
      expect(decodeCursor('')).toBeNull();
    });

    it('should return null for a random string', () => {
      expect(decodeCursor('not-a-cursor')).toBeNull();
    });

    it('should return null for base64 without required fields', () => {
      const bad = Buffer.from(JSON.stringify({ foo: 'bar' })).toString('base64url');
      expect(decodeCursor(bad)).toBeNull();
    });

    it('should return null for invalid date in updated_at', () => {
      const bad = Buffer.from(
        JSON.stringify({ updated_at: 'not-a-date', id: '550e8400-e29b-41d4-a716-446655440000' }),
      ).toString('base64url');
      expect(decodeCursor(bad)).toBeNull();
    });

    it('should return null for invalid UUID in id field', () => {
      const bad = Buffer.from(
        JSON.stringify({ updated_at: '2024-03-20T14:45:00.000Z', id: 'not-a-uuid' }),
      ).toString('base64url');
      expect(decodeCursor(bad)).toBeNull();
    });

    it('should return null for a cursor with wrong types', () => {
      const bad = Buffer.from(
        JSON.stringify({ updated_at: 12345, id: 67890 }),
      ).toString('base64url');
      expect(decodeCursor(bad)).toBeNull();
    });
  });
});
