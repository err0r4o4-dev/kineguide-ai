import { z } from 'zod'

const envSchema = z.object({
  VITE_API_BASE_URL: z
    .string()
    .min(1, 'VITE_API_BASE_URL is required')
    .refine(
      (value) => value.startsWith('/') || URL.canParse(value),
      'VITE_API_BASE_URL must be an absolute URL or root-relative path'
    )
})

export const env = envSchema.parse({
  VITE_API_BASE_URL:
    import.meta.env.VITE_API_BASE_URL ??
    (import.meta.env.MODE === 'test'
      ? '/api/v1'
      : import.meta.env.MODE === 'development'
        ? 'http://localhost:8080/api/v1'
        : undefined)
})
