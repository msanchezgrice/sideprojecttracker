import { clerkClient } from '@clerk/clerk-sdk-node';
import type { Request, Response, NextFunction } from 'express';

// Middleware to verify Clerk session tokens
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    // Get session token from Authorization header
    const authHeader = req.headers.authorization;
    const sessionToken = authHeader?.startsWith('Bearer ') 
      ? authHeader.substring(7)
      : null;
    
    if (!sessionToken) {
      return res.status(401).json({ message: 'No session token provided' });
    }

    // Get session from Clerk using the session ID
    const session = await clerkClient.sessions.getSession(sessionToken);
    
    if (!session || session.status !== 'active') {
      return res.status(401).json({ message: 'Invalid or expired session' });
    }

    // Get user information from Clerk
    const user = await clerkClient.users.getUser(session.userId);
    
    // Store user data in our database for consistency
    await req.app.locals.storage.upsertUser({
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress || null,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImageUrl: user.imageUrl,
    });
    
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
    console.error('Clerk auth verification error:', error);
    return res.status(401).json({ message: 'Authentication failed' });
  }
}