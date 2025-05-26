import { clerkClient } from '@clerk/clerk-sdk-node';
import type { Request, Response, NextFunction } from 'express';

// Middleware to verify Clerk session tokens with custom claims
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    console.log('🔍 Auth middleware - Headers:', {
      authorization: req.headers.authorization ? 'Present' : 'Missing',
      userAgent: req.headers['user-agent'],
      url: req.url
    });
    
    // Get session token from Authorization header
    const authHeader = req.headers.authorization;
    const sessionToken = authHeader?.startsWith('Bearer ') 
      ? authHeader.substring(7)
      : null;
    
    console.log('🔑 Session token:', sessionToken ? 'Present (length: ' + sessionToken.length + ')' : 'Missing');
    
    if (!sessionToken) {
      console.log('❌ No session token provided');
      return res.status(401).json({ message: 'No session token provided' });
    }

    // Verify the JWT token and extract claims
    const sessionClaims = await clerkClient.verifyToken(sessionToken);
    
    if (!sessionClaims || !sessionClaims.userId) {
      return res.status(401).json({ message: 'Invalid session token' });
    }

    // Get user information from Clerk using the userId from claims
    const user = await clerkClient.users.getUser(sessionClaims.userId);
    
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