/**
 * Mock for next-auth/lib/env.js
 * Prevents next-auth from importing next/server in test environment
 */

export const AUTH_URL = process.env.AUTH_URL || "http://localhost:3000";
export const AUTH_SECRET = process.env.AUTH_SECRET || "test-secret";
export const NODE_ENV = process.env.NODE_ENV || "test";
