import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import getDb from '@/lib/db';

export async function GET(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get('days') || '30');

  const db = getDb();

  const history = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    const cal = db.prepare('SELECT SUM(calories) as total FROM food_logs WHERE user_id = ? AND date = ?').get(user.userId, dateStr) as { total: number };
    const burned = db.prepare('SELECT SUM(calories_burned) as total FROM activity_logs WHERE user_id = ? AND date = ?').get(user.userId, dateStr) as { total: number };
    const water = db.prepare('SELECT SUM(amount_ml) as total FROM water_logs WHERE user_id = ? AND date = ?').get(user.userId, dateStr) as { total: number };
    const summary = db.prepare('SELECT score FROM daily_summaries WHERE user_id = ? AND date = ?').get(user.userId, dateStr) as { score: number } | undefined;

    history.push({
      date: dateStr,
      calories_in: cal.total || 0,
      calories_burned: burned.total || 0,
      water_ml: water.total || 0,
      score: summary?.score || null,
    });
  }

  const metrics = db.prepare('SELECT * FROM body_metrics WHERE user_id = ? ORDER BY date DESC LIMIT 30').all(user.userId);
  const summaries = db.prepare('SELECT * FROM daily_summaries WHERE user_id = ? ORDER BY date DESC LIMIT 30').all(user.userId);

  return NextResponse.json({ history, metrics, summaries });
}
