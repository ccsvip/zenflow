import { createHmac, timingSafeEqual } from 'node:crypto';

const DEFAULT_SESSION_TTL_HOURS = 24;

function base64UrlEncode(value) {
  return Buffer.from(JSON.stringify(value)).toString('base64url');
}

function base64UrlDecode(value) {
  return JSON.parse(Buffer.from(value, 'base64url').toString('utf8'));
}

function getSessionSecret() {
  return (
    process.env.SESSION_SECRET ||
    process.env.DB_PASSWORD ||
    'zenflow-local-session-secret'
  );
}

function signPayload(payload) {
  return createHmac('sha256', getSessionSecret()).update(payload).digest('base64url');
}

export function getSessionTtlMs() {
  const ttlHours = Number(process.env.SESSION_TTL_HOURS);
  const safeHours = Number.isFinite(ttlHours) && ttlHours > 0
    ? ttlHours
    : DEFAULT_SESSION_TTL_HOURS;
  return safeHours * 60 * 60 * 1000;
}

export function createSession(user, now = Date.now()) {
  const safeUser = {
    id: user.id,
    username: user.username,
    role: user.role,
  };
  const expiresAt = now + getSessionTtlMs();
  const payload = base64UrlEncode({ user: safeUser, expiresAt });
  const signature = signPayload(payload);

  return {
    user: safeUser,
    token: `${payload}.${signature}`,
    expiresAt,
  };
}

export function verifySessionToken(token, now = Date.now()) {
  if (!token || typeof token !== 'string') return null;

  const [payload, signature] = token.split('.');
  if (!payload || !signature) return null;

  const expected = signPayload(payload);
  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(signature);
  if (
    expectedBuffer.length !== actualBuffer.length ||
    !timingSafeEqual(expectedBuffer, actualBuffer)
  ) {
    return null;
  }

  try {
    const session = base64UrlDecode(payload);
    if (!session?.user || session.expiresAt <= now) return null;
    return session.user;
  } catch {
    return null;
  }
}
