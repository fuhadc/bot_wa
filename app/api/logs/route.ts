import { NextResponse } from 'next/server';
import { getLogs } from '@/lib/storage';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const username = cookieStore.get('session_user')?.value;
  if (!username) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const logs = await getLogs(username);
  return NextResponse.json({ logs });
}
