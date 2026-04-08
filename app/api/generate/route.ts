import { NextResponse } from 'next/server';
import { generateMessage, generateWaLink } from '@/lib/generator';
import { saveLog } from '@/lib/storage';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const username = cookieStore.get('session_user')?.value;
    if (!username) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { name, phone, vendor, maps_link } = await request.json();

    if (!name || !phone || !vendor || !maps_link) {
      return NextResponse.json({ error: 'Missing customer or vendor details' }, { status: 400 });
    }

    try {
      const message = generateMessage(name, vendor, maps_link);
      const waLink = generateWaLink(phone, message);
      
      await saveLog(username, phone, name, vendor, 'opened');
      
      return NextResponse.json({ success: true, wa_link: waLink });
    } catch (err) {
      await saveLog(username, phone, name, vendor, 'failed');
      throw err;
    }
  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
