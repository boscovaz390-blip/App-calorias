import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { hashPassword, signToken, createAuthCookie } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Todos los campos son requeridos' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 6 caracteres' }, { status: 400 });
    }

    const db = getDb();
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return NextResponse.json({ error: 'Ya existe una cuenta con este email' }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const result = db.prepare(
      'INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)'
    ).run(email, passwordHash, name);

    const userId = result.lastInsertRowid as number;
    const token = signToken({ userId, email, name });
    const cookieData = createAuthCookie(token);

    const cookieStore = await cookies();
    cookieStore.set(cookieData);

    return NextResponse.json({
      success: true,
      user: { id: userId, email, name },
      needsOnboarding: true,
    });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
