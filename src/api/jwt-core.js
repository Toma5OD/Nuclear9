import jwt from 'jsonwebtoken';

const BEARER = /^bearer ([A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]*)$/i;
const usableSecret = secret => typeof secret === 'string' && secret.trim().length > 0;

export function signUserToken(user, secret) {
  if (!usableSecret(secret)) throw new Error('JWT secret is not configured');
  return jwt.sign({ id: String(user._id), email: user.email }, secret, {
    algorithm: 'HS256', expiresIn: '1h',
  });
}

export function extractBearerToken(header) {
  if (typeof header !== 'string' || header.length > 4096) return null;
  return BEARER.exec(header.trim())?.[1] ?? null;
}

export function verifyUserToken(token, secret) {
  if (!usableSecret(secret) || typeof token !== 'string' || !token || token.length > 4096) return null;
  try {
    const decoded = jwt.verify(token, secret, { algorithms: ['HS256'] });
    if (!decoded || typeof decoded !== 'object' || typeof decoded.id !== 'string' || !decoded.id.trim()) return null;
    return decoded;
  } catch {
    return null;
  }
}

export function decodeTokenWith(token, secret) {
  const decoded = verifyUserToken(token, secret);
  return decoded ? { userId: decoded.id, email: decoded.email } : {};
}

export function userIdFromAuthHeader(header, secret) {
  return verifyUserToken(extractBearerToken(header), secret)?.id ?? null;
}
