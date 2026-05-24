import { NextResponse } from 'next/server';
import { db } from '@/db';
import { jobs } from '@/db/schema';
import { eq, and, lt } from 'drizzle-orm';

// Prevent Next.js from caching this API route
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    // Security Check: Only allow if the correct secret is provided
    // If running locally without CRON_SECRET, we allow it for testing,
    // but in production, CRON_SECRET should be defined in Vercel.
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Calculate timestamp for 12 hours ago
    const twelveHoursAgo = new Date();
    twelveHoursAgo.setHours(twelveHoursAgo.getHours() - 12);

    // Update database: Set all PENDING jobs older than 12 hours to CANCELLED
    const canceledJobs = await db.update(jobs)
      .set({
        status: 'CANCELLED',
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(jobs.status, 'PENDING'),
          lt(jobs.createdAt, twelveHoursAgo)
        )
      )
      .returning({ id: jobs.id });

    return NextResponse.json({ 
      success: true, 
      message: `Cleaned up ${canceledJobs.length} expired jobs.`,
      canceledIds: canceledJobs.map(j => j.id)
    });
  } catch (error) {
    console.error('Cron Cleanup Error:', error);
    return NextResponse.json({ error: 'Failed to execute cleanup' }, { status: 500 });
  }
}
