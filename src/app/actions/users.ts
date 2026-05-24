'use server';

import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function syncUser(lineUserId: string, displayName: string, pictureUrl?: string) {
  try {
    // Check if user exists
    const existingUser = await db.select().from(users).where(eq(users.id, lineUserId)).limit(1);

    if (existingUser.length > 0) {
      // Update display name and picture if changed
      await db.update(users)
        .set({ 
          displayName, 
          pictureUrl: pictureUrl || existingUser[0].pictureUrl,
          updatedAt: new Date() 
        })
        .where(eq(users.id, lineUserId));
      
      return { success: true, role: existingUser[0].role };
    } else {
      // Insert new user with default OPERATOR role
      await db.insert(users).values({
        id: lineUserId,
        displayName,
        pictureUrl,
        role: 'OPERATOR',
      });
      
      return { success: true, role: 'OPERATOR' };
    }
  } catch (error) {
    console.error('Failed to sync user:', error);
    return { success: false, error: 'Failed to sync user data' };
  }
}

export async function getAllUsers() {
  try {
    const allUsers = await db.select().from(users);
    // Sort manually or use orderBy if added to imports
    allUsers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return { success: true, users: allUsers };
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return { success: false, error: 'Failed to fetch users' };
  }
}

export async function updateUserRole(userId: string, newRole: 'OPERATOR' | 'DRIVER' | 'ADMIN') {
  try {
    await db.update(users)
      .set({ 
        role: newRole,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
    
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Failed to update role:', error);
    return { success: false, error: 'Failed to update user role' };
  }
}
