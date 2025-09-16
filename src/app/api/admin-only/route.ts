import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/server-session';

export async function GET() {
  const session = await getServerSession();
  if (!session || session.role !== 'admin') {
    return new NextResponse('Forbidden', { status: 403 });
  }
  return NextResponse.json({ ok: true });
}
