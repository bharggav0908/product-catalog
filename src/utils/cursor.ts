import { CursorPayload } from '../types';

/**
 * Encodes a cursor payload into a base64 URL-safe string.
 *
 * The cursor contains `updated_at` (ISO string) and `id` (UUID)
 * which together uniquely identify a position in our sorted result set.
 */
export function encodeCursor(payload: CursorPayload): string {
  const json = JSON.stringify(payload);
  return Buffer.from(json, 'utf-8').toString('base64url');
}

/**
 * Decodes a base64 cursor string back into a CursorPayload.
 *
 * Returns null if the cursor is malformed — the service layer
 * will throw a 400 error in that case.
 */
export function decodeCursor(cursor: string): CursorPayload | null {
  try {
    const json = Buffer.from(cursor, 'base64url').toString('utf-8');
    const parsed: unknown = JSON.parse(json);

    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      !('updated_at' in parsed) ||
      !('id' in parsed) ||
      typeof (parsed as Record<string, unknown>).updated_at !== 'string' ||
      typeof (parsed as Record<string, unknown>).id !== 'string'
    ) {
      return null;
    }

    const payload = parsed as CursorPayload;

    // Validate that updated_at is a parseable date
    const date = new Date(payload.updated_at);
    if (isNaN(date.getTime())) {
      return null;
    }

    // Basic UUID format check
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(payload.id)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
