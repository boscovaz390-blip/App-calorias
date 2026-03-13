import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import getDb from '@/lib/db';

export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  try {
    const { date, meal_type, food_name, calories, protein_g, carbs_g, fat_g, fiber_g, notes, ai_analysis } = await request.json();

    const db = getDb();
    const result = db.prepare(`
      INSERT INTO food_logs (user_id, date, meal_type, food_name, calories, protein_g, carbs_g, fat_g, fiber_g, notes, ai_analysis)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(user.userId, date, meal_type, food_name, calories, protein_g || 0, carbs_g || 0, fat_g || 0, fiber_g || 0, notes || '', ai_analysis || '');

    return NextResponse.json({ success: true, id: result.lastInsertRowid });
  } catch (error) {
    console.error('Food log error:', error);
    return NextResponse.json({ error: 'Error al guardar alimento' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

  const db = getDb();
  const logs = db.prepare('SELECT * FROM food_logs WHERE user_id = ? AND date = ? ORDER BY created_at ASC').all(user.userId, date);

  return NextResponse.json({ logs });
}

export async function DELETE(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });

  const db = getDb();
  db.prepare('DELETE FROM food_logs WHERE id = ? AND user_id = ?').run(id, user.userId);

  return NextResponse.json({ success: true });
}
