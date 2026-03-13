import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import getDb from '@/lib/db';

export async function GET() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  const db = getDb();
  const dbUser = db.prepare('SELECT id, email, name, onboarding_completed FROM users WHERE id = ?').get(user.userId) as {
    id: number; email: string; name: string; onboarding_completed: number;
  } | undefined;

  if (!dbUser) {
    return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
  }

  const profile = db.prepare('SELECT * FROM user_profiles WHERE user_id = ?').get(user.userId);

  return NextResponse.json({
    user: dbUser,
    profile,
    needsOnboarding: !dbUser.onboarding_completed,
  });
}
