// @ts-check
import { createHmac, timingSafeEqual } from 'node:crypto';

// Sesi admin bertanda tangan. ADMIN_TOKEN hanya jadi kunci HMAC di server,
// tidak pernah dikirim mentah ke browser.

/**
 * @param {string} encoded
 * @param {string} secret
 */
function sign(encoded, secret) {
  return createHmac('sha256', secret).update(encoded).digest('hex');
}

/**
 * @param {string} secret
 * @param {number} [ttlSeconds]
 */
export function createAdminSession(secret, ttlSeconds = 28800) {
  const payload = Buffer.from(
    JSON.stringify({ sub: 'admin', exp: Math.floor(Date.now() / 1000) + ttlSeconds }),
    'utf8'
  ).toString('base64url');
  return `${payload}.${sign(payload, secret)}`;
}

/**
 * @param {string | undefined} authHeader
 * @param {string | undefined} secret
 */
export function verifyAdminSession(authHeader, secret) {
  if (!secret || typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) return false;

  const token = authHeader.slice(7).trim();
  const parts = token.split('.');
  if (parts.length !== 2 || !parts[0] || !parts[1]) return false;

  const [encoded, signature] = parts;
  const expected = sign(encoded, secret);
  const a = Buffer.from(signature, 'utf8');
  const b = Buffer.from(expected, 'utf8');
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;

  let payload;
  try {
    payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
  } catch {
    return false;
  }

  return (
    payload?.sub === 'admin' &&
    typeof payload?.exp === 'number' &&
    payload.exp > Math.floor(Date.now() / 1000)
  );
}
