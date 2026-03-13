import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { verifyPassword, signToken, createAuthCookie } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email y contraseña son requeridos' }, { status: 400 });
    }

    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as {
      id: number; email: string; password_hash: string; name: string; onboarding_completed: number;
    } | undefined;

    if (!user) {
      return NextResponse.json({ error: 'Email o contraseña incorrectos' }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: 'Email o contraseña incorrectos' }, { status: 401 });
    }

    const token = signToken({ userId: user.id, email: user.email, name: user.name });
    const cookieData = createAuthCookie(token);

    const cookieStore = await cookies();
    cookieStore.set(cookieData);

    return NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name },
      needsOnboarding: !user.onboarding_completed,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
