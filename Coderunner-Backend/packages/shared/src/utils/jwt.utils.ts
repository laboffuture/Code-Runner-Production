import jwt from 'jsonwebtoken';
import { AuthToken } from '../types';

// Lazy validation - only validate when JWT functions are called
// This allows dotenv to load first in index.ts
let JWT_SECRET: string | null = null;
const JWT_EXPIRES_IN = '7d'; // Token expires in 7 days

function getJWTSecret(): string {
  if (JWT_SECRET) {
    return JWT_SECRET;
  }

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('FATAL: JWT_SECRET environment variable is required');
  }

  if (secret.length < 32) {
    throw new Error('FATAL: JWT_SECRET must be at least 32 characters');
  }

  const WEAK_SECRETS = ['secret', 'default', 'password', 'jwt_secret', 'change', 'replace_me', 'your-super'];
  if (WEAK_SECRETS.some(weak => secret.toLowerCase().includes(weak))) {
    throw new Error('FATAL: JWT_SECRET appears to be a weak/default value. Generate one with: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'base64\'))"');
  }

  JWT_SECRET = secret;
  return JWT_SECRET;
}

export function generateToken(payload: Omit<AuthToken, 'iat' | 'exp'>): string {
  return jwt.sign(payload, getJWTSecret(), {
    expiresIn: JWT_EXPIRES_IN,
  });
}

export function verifyToken(token: string): AuthToken {
  try {
    const decoded = jwt.verify(token, getJWTSecret()) as AuthToken;
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

// ---------------------------------------------------------------------------
// ADMIN-LINK hub single-sign-on
// ---------------------------------------------------------------------------

/** Decoded claims of a token minted by the ADMIN-LINK hub. */
export interface HubSsoClaims {
  /** The hub principal (e.g. "hub-admin"). */
  sub?: string;
  /** This module's id — must match HUB_SSO_AUDIENCE. */
  aud?: string | string[];
  iat?: number;
  exp?: number;
}

/** Thrown by {@link verifyHubSsoToken} when hub SSO isn't configured on this
 *  server, so the caller can return a "fall back to normal login" response
 *  rather than treating it as an auth failure. */
export const HUB_SSO_NOT_CONFIGURED = 'HUB_SSO_NOT_CONFIGURED';

/**
 * Verify a single-sign-on token issued by the ADMIN-LINK hub when it frames a
 * module's admin page. This uses a SEPARATE secret (`HUB_SSO_SECRET`) from the
 * app's own `JWT_SECRET` — the hub and each module share it out-of-band via env,
 * never in git. Enforces HS256 (so a forged `alg:none`/RS token is rejected),
 * the configured audience (`HUB_SSO_AUDIENCE` = this module's id), and expiry
 * (the hub mints 60-second tokens). Throws on any verification failure; throws
 * {@link HUB_SSO_NOT_CONFIGURED} when the env isn't set.
 */
export function verifyHubSsoToken(token: string): HubSsoClaims {
  const secret = process.env.HUB_SSO_SECRET;
  const audience = process.env.HUB_SSO_AUDIENCE;

  if (!secret || !audience) {
    throw new Error(HUB_SSO_NOT_CONFIGURED);
  }
  if (secret.length < 32) {
    throw new Error('FATAL: HUB_SSO_SECRET must be at least 32 characters');
  }

  return jwt.verify(token, secret, {
    algorithms: ['HS256'],
    audience,
  }) as HubSsoClaims;
}
