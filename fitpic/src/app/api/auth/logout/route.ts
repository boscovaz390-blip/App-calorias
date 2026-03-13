import { NextResponse } from 'next/server';
import { clearAuthCookie } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST() {
  const cookieData = clearAuthCookie();
  const cookieStore = await cookies();
  cookieStore.set(cookieData);
  return NextResponse.json({ success: true });
}
