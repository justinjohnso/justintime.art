/**
 * Webhook Security Utilities
 * 
 * Provides authentication and signature verification for incoming webhooks
 */

import crypto from 'crypto';

/**
 * Verify webhook signature using HMAC SHA256
 * 
 * @param payload - Raw request body
 * @param signature - Signature from webhook header
 * @param secret - Webhook secret from environment
 * @returns True if signature is valid
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(payload).digest('hex');
  const expectedSignature = `sha256=${digest}`;
  
  // Use timing-safe comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

/**
 * Verify Notion webhook signature
 * Notion uses a different signature scheme
 * 
 * @param payload - Raw request body
 * @param signature - Signature from Notion-Signature header
 * @param secret - Webhook secret from Notion
 * @returns True if signature is valid
 */
export function verifyNotionSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  // Notion uses HMAC SHA256 with timestamp
  // Format: "t=timestamp,v1=signature"
  const parts = signature.split(',').reduce((acc, part) => {
    const [key, value] = part.split('=');
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);

  const timestamp = parts.t;
  const receivedSignature = parts.v1;

  if (!timestamp || !receivedSignature) {
    return false;
  }

  // Verify timestamp is recent (within 5 minutes)
  const currentTime = Math.floor(Date.now() / 1000);
  const timestampNum = parseInt(timestamp, 10);
  const timeDiff = Math.abs(currentTime - timestampNum);
  
  if (timeDiff > 300) { // 5 minutes
    return false;
  }

  // Compute expected signature
  const signedPayload = `${timestamp}.${payload}`;
  const hmac = crypto.createHmac('sha256', secret);
  const expectedSignature = hmac.update(signedPayload).digest('hex');

  // Use timing-safe comparison
  return crypto.timingSafeEqual(
    Buffer.from(receivedSignature),
    Buffer.from(expectedSignature)
  );
}

/**
 * Generate a webhook secret
 * Use this to create secrets for .env file
 * 
 * @returns Random 32-byte hex string
 */
export function generateWebhookSecret(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Validate required environment variables
 * 
 * @param vars - Object of environment variable names and their values
 * @throws Error if any variable is missing
 */
export function validateEnvVars(vars: Record<string, string | undefined>): void {
  const missing = Object.entries(vars)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }
}

/**
 * Rate limiting (simple in-memory implementation)
 * 
 * NOTE: This is a basic implementation suitable for single-instance deployments.
 * For production with multiple instances, use Redis with a library like 'ioredis' 
 * or a managed service like Upstash.
 * 
 * For now, this provides basic protection against abuse without additional dependencies.
 */
class RateLimiter {
  private requests: Map<string, number[]> = new Map();

  /**
   * Check if request is allowed
   * 
   * @param key - Identifier (IP address, API key, etc.)
   * @param limit - Maximum requests allowed
   * @param window - Time window in seconds
   * @returns True if request is allowed
   */
  isAllowed(key: string, limit: number = 10, window: number = 60): boolean {
    const now = Date.now();
    const windowStart = now - window * 1000;

    // Get existing requests for this key
    let timestamps = this.requests.get(key) || [];

    // Filter out old requests outside the window
    timestamps = timestamps.filter(t => t > windowStart);

    // Check if limit exceeded
    if (timestamps.length >= limit) {
      return false;
    }

    // Add current request
    timestamps.push(now);
    this.requests.set(key, timestamps);

    // Cleanup old entries periodically
    if (Math.random() < 0.01) { // 1% chance
      this.cleanup(windowStart);
    }

    return true;
  }

  private cleanup(before: number): void {
    for (const [key, timestamps] of this.requests.entries()) {
      const filtered = timestamps.filter(t => t > before);
      if (filtered.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, filtered);
      }
    }
  }
}

export const rateLimiter = new RateLimiter();
