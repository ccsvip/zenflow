import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

export const DEFAULT_ADMIN_USERNAME = 'root';
export const DEFAULT_ADMIN_PASSWORD = '1314520sm';

export function hashPassword(password, salt = randomBytes(16).toString('hex')) {
  const hash = scryptSync(String(password), salt, 64).toString('hex');
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(password, storedHash) {
  if (!storedHash || typeof storedHash !== 'string') return false;

  const [algorithm, salt, hash] = storedHash.split('$');
  if (algorithm !== 'scrypt' || !salt || !hash) return false;

  const expected = Buffer.from(hash, 'hex');
  const actual = scryptSync(String(password), salt, expected.length);

  return (
    expected.length === actual.length &&
    timingSafeEqual(expected, actual)
  );
}
