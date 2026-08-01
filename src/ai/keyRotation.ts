import { env } from '@/src/config/env';

/**
 * KeyRotationService manages a pool of API keys and automatically rotates them.
 */
export class KeyRotationService {
  private keys: string[];
  private currentIndex: number;

  constructor(commaSeparatedKeys: string) {
    this.keys = commaSeparatedKeys.split(',').map((k) => k.trim()).filter((k) => k.length > 0);
    this.currentIndex = 0;

    if (this.keys.length === 0) {
      throw new Error('No valid API keys provided to KeyRotationService');
    }
  }

  /**
   * Get the current active API key.
   */
  public getCurrentKey(): string {
    return this.keys[this.currentIndex];
  }

  /**
   * Rotate to the next available API key.
   */
  public rotateKey(): string {
    this.currentIndex = (this.currentIndex + 1) % this.keys.length;
    console.log(`[KeyRotationService] Rotated to key index ${this.currentIndex}`);
    return this.getCurrentKey();
  }

  /**
   * Execute an API call with automatic key rotation on failure (rate limits / quota).
   * @param apiCall Function that takes the current API key and returns a Promise
   * @param maxRetries Maximum number of retries across different keys
   */
  public async executeWithRotation<T>(
    apiCall: (apiKey: string) => Promise<T>,
    maxRetries: number = this.keys.length
  ): Promise<T> {
    let attempts = 0;
    let lastError: any;

    while (attempts < maxRetries) {
      try {
        const currentKey = this.getCurrentKey();
        const result = await apiCall(currentKey);
        return result;
      } catch (error: any) {
        lastError = error;
        // Typically rate limit errors have specific status codes (e.g., 429)
        // or quota exceeded (e.g., 403). We will rotate aggressively on any failure for robustness,
        // but ideally you filter by status code.
        const isRateLimitOrQuota = 
            error?.status === 429 || 
            error?.response?.status === 429 || 
            error?.status === 403 || 
            error?.response?.status === 403;

        if (isRateLimitOrQuota || attempts < maxRetries - 1) {
            console.warn(`[KeyRotationService] API call failed (Attempt ${attempts + 1}/${maxRetries}). Rotating key...`);
            this.rotateKey();
            attempts++;
        } else {
            break;
        }
      }
    }

    throw new Error(`API call failed after ${attempts} attempts. Last error: ${lastError?.message || lastError}`);
  }
}

// Global instances for Gemini and Groq
export const geminiKeyManager = new KeyRotationService(env.GEMINI_API_KEYS);
export const groqKeyManager = new KeyRotationService(env.GROQ_API_KEYS);
