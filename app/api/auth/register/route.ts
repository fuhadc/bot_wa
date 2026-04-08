import { NextResponse } from 'next/server';
import { addUser } from '@/lib/storage';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ success: false, error: 'Username and password are required' }, { status: 400 });
    }

    const { success, message } = await addUser(username, password);

    if (success) {
      return NextResponse.json({ success: true, message });
    } else {
      return NextResponse.json({ success: false, error: message }, { status: 400 });
    }
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
