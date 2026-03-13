import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import getDb from '@/lib/db';

export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  try {
    const { date, weight_kg, body_fat_pct, notes } = await request.json();

    const db = getDb();
    const result = db.prepare(`
      INSERT INTO body_metrics (user_id, date, weight_kg, body_fat_pct, notes)
      VALUES (?, ?, ?, ?, ?)
    `).run(user.userId, date, weight_kg || null, body_fat_pct || null, notes || '');

    if (weight_kg) {
      db.prepare('UPDATE user_profiles SET weight_kg = ?, updated_at = datetime("now") WHERE user_id = ?').run(weight_kg, user.userId);
    }

    return NextResponse.json({ success: true, id: result.lastInsertRowid });
  } catch (error) {
    console.error('Body metrics error:', error);
    return NextResponse.json({ error: 'Error al guardar métricas' }, { status: 500 });
  }
}
