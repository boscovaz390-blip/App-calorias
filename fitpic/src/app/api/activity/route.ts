import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import getDb from '@/lib/db';

export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  try {
    const { date, activity_name, category, duration_minutes, calories_burned, intensity, notes } = await request.json();

    const db = getDb();
    const result = db.prepare(`
      INSERT INTO activity_logs (user_id, date, activity_name, category, duration_minutes, calories_burned, intensity, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(user.userId, date, activity_name, category, duration_minutes, calories_burned, intensity || 'moderate', notes || '');

    return NextResponse.json({ success: true, id: result.lastInsertRowid });
  } catch (error) {
    console.error('Activity log error:', error);
    return NextResponse.json({ error: 'Error al guardar actividad' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

  const db = getDb();
  const logs = db.prepare('SELECT * FROM activity_logs WHERE user_id = ? AND date = ? ORDER BY created_at ASC').all(user.userId, date);

  return NextResponse.json({ logs });
}

export async function DELETE(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });

  const db = getDb();
  db.prepare('DELETE FROM activity_logs WHERE id = ? AND user_id = ?').run(id, user.userId);

  return NextResponse.json({ success: true });
}
