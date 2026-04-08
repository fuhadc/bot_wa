import { NextResponse } from 'next/server';
import { getVendors, addVendor, deleteVendor } from '@/lib/storage';
import { cookies } from 'next/headers';

async function getAuthUser() {
  const cookieStore = await cookies();
  return cookieStore.get('session_user')?.value;
}

export async function GET() {
  const username = await getAuthUser();
  if (!username) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const vendors = getVendors(username);
  return NextResponse.json({ vendors });
}

export async function POST(request: Request) {
  const username = await getAuthUser();
  if (!username) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { name, maps_link } = await request.json();
  if (!name || !maps_link) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

  const vendor = addVendor(username, name, maps_link);
  return NextResponse.json({ success: true, vendor });
}

export async function DELETE(request: Request) {
  const username = await getAuthUser();
  if (!username) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

  deleteVendor(username, id);
  return NextResponse.json({ success: true });
}
