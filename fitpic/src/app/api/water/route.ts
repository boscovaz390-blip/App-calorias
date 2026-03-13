import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import getDb from '@/lib/db';

export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  try {
    const { date, amount_ml } = await request.json();

    const db = getDb();
    const result = db.prepare('INSERT INTO water_logs (user_id, date, amount_ml) VALUES (?, ?, ?)').run(user.userId, date, amount_ml);

    return NextResponse.json({ success: true, id: result.lastInsertRowid });
  } catch (error) {
    console.error('Water log error:', error);
    return NextResponse.json({ error: 'Error al guardar agua' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

  const db = getDb();
  const logs = db.prepare('SELECT * FROM water_logs WHERE user_id = ? AND date = ? ORDER BY created_at ASC').all(user.userId, date);
  const total = db.prepare('SELECT SUM(amount_ml) as total FROM water_logs WHERE user_id = ? AND date = ?').get(user.userId, date) as { total: number };

  return NextResponse.json({ logs, total: total.total || 0 });
}

export async function DELETE(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });

  const db = getDb();
  db.prepare('DELETE FROM water_logs WHERE id = ? AND user_id = ?').run(id, user.userId);

  return NextResponse.json({ success: true });
}
