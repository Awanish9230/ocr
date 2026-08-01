import { z } from 'zod';

const envSchema = z.object({
  MONGODB_URI: z.string().url('Invalid MongoDB URI'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters long'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters long'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  GEMINI_API_KEYS: z.string().min(1, 'GEMINI_API_KEYS is required (comma separated)'),
  GROQ_API_KEYS: z.string().min(1, 'GROQ_API_KEYS is required (comma separated)'),
  CLOUDINARY_CLOUD_NAME: z.string().min(1, 'CLOUDINARY_CLOUD_NAME is required'),
  CLOUDINARY_API_KEY: z.string().min(1, 'CLOUDINARY_API_KEY is required'),
  CLOUDINARY_API_SECRET: z.string().min(1, 'CLOUDINARY_API_SECRET is required'),
  NEXT_PUBLIC_API_URL: z.string().url().optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

let env: z.infer<typeof envSchema>;

try {
  // During build time on Vercel, some env vars might be missing if not strictly provided.
  // Using a soft parse or throwing a detailed error.
  env = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('❌ Invalid environment variables:', error.flatten().fieldErrors);
    throw new Error('Invalid environment variables');
  }
  throw error;
}

export { env };
