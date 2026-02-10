/**
 * Login Form Validation Schema
 * 
 * Zod schema for validating login form inputs.
 * Validates email format, password length, and remember me checkbox.
 */

import { z } from 'zod';

/**
 * Login form validation schema
 * 
 * Validates:
 * - Email: Required, must be valid email format
 * - Password: Required, min 8 chars, max 100 chars
 * - Remember me: Optional boolean
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format'),
  
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password is too long'),
  
  rememberMe: z.boolean().optional(),
});

/**
 * TypeScript type inferred from the login schema
 * Use this type for form data throughout the application
 */
export type LoginFormData = z.infer<typeof loginSchema>;
