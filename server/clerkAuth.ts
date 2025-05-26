import { clerkClient } from '@clerk/clerk-sdk-node';
import type { Request, Response, NextFunction } from 'express';

// Middleware to verify Clerk JWT tokens
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const sessionToken = req.headers.authorization?.replace('Bearer ', '');
    
    if (!sessionToken) {
      return res.status(401).json({ message: 'No session token provided' });
    }

    // Verify the session token with Clerk
    const session = await clerkClient.sessions.verifySession(sessionToken, req.headers.host || '');
    
    if (!session) {
      return res.status(401).json({ message: 'Invalid session' });
    }

    // Get user information
    const user = await clerkClient.users.getUser(session.userId);
    
    // Attach user info to request
    (req as any).user = {
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress,
      firstName: user.firstName,
      lastName: user.lastName,
      imageUrl: user.imageUrl,
    };

    next();
  } catch (error) {
    console.error('Auth verification error:', error);
    return res.status(401).json({ message: 'Unauthorized' });
  }
}

// Simple auth check that doesn't require a token (for testing)
export function simpleAuth(req: Request, res: Response, next: NextFunction) {
  // For now, let's create a default user to test the flow
  (req as any).user = {
    id: 'test-user-id',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    imageUrl: null,
  };
  next();
}