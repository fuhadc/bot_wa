import { NextResponse } from 'next/server';
import { getLogs } from '@/lib/storage';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const username = cookieStore.get('session_user')?.value;
  if (!username) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const logs = getLogs(username);
  // Sort by timestamp newest first
  const sortedLogs = logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  return NextResponse.json({ logs: sortedLogs });
}
