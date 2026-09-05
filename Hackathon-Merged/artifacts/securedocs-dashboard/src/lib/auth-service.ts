import { account } from './appwrite';
import type { Models } from 'appwrite';

export type AppwriteUser = Models.User<Models.Preferences>;
export type AppwriteSession = Models.Session;

/**
 * Log in using email and password.
 * Uses account.createEmailPasswordSession (Appwrite SDK v14+)
 * with backward-compatible fallback to createEmailSession if needed.
 */
export async function loginWithEmail(email: string, password: string): Promise<AppwriteSession> {
  if (typeof (account as any).createEmailPasswordSession === 'function') {
    return await (account as any).createEmailPasswordSession(email, password);
  }
  return await (account as any).createEmailSession(email, password);
}

/**
 * Log out the currently authenticated user by deleting the current active session.
 */
export async function logoutCurrentUser(): Promise<void> {
  await account.deleteSession('current');
}

/**
 * Fetch the currently logged-in user details.
 * Returns null if no active session exists or on 401 unauthenticated.
 */
export async function getCurrentUser(): Promise<AppwriteUser | null> {
  try {
    const user = await account.get();
    return user;
  } catch (error: any) {
    // If not logged in, Appwrite throws a 401 error
    if (error?.code === 401 || error?.status === 401) {
      return null;
    }
    // Also catch other unauthenticated exceptions gracefully
    return null;
  }
}

/**
 * Fetch the currently active session.
 * Returns null if not authenticated.
 */
export async function getCurrentSession(): Promise<AppwriteSession | null> {
  try {
    const session = await account.getSession('current');
    return session;
  } catch {
    return null;
  }
}

/**
 * Helper to extract error messages from Appwrite errors without hiding the exact error.
 */
export function getAuthErrorMessage(error: any): string {
  if (!error) return 'An unexpected error occurred.';
  if (typeof error === 'string') return error;
  if (error.message) {
    return error.message;
  }
  if (error.response?.message) {
    return error.response.message;
  }
  return error.toString?.() || 'Authentication failed. Please check your credentials and try again.';
}
