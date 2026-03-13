import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import getDb from '@/lib/db';

export async function GET(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

  const db = getDb();

  const profile = db.prepare('SELECT * FROM user_profiles WHERE user_id = ?').get(user.userId) as {
    daily_calorie_goal: number; daily_water_goal: number; goal: string;
    weight_kg: number; target_weight_kg: number;
  } | undefined;

  const foodLogs = db.prepare('SELECT * FROM food_logs WHERE user_id = ? AND date = ? ORDER BY created_at ASC').all(user.userId, date);
  const activityLogs = db.prepare('SELECT * FROM activity_logs WHERE user_id = ? AND date = ? ORDER BY created_at ASC').all(user.userId, date);
  const waterTotal = db.prepare('SELECT SUM(amount_ml) as total FROM water_logs WHERE user_id = ? AND date = ?').get(user.userId, date) as { total: number };

  const totalCaloriesIn = (foodLogs as Array<{ calories: number }>).reduce((sum, f) => sum + f.calories, 0);
  const totalCaloriesBurned = (activityLogs as Array<{ calories_burned: number }>).reduce((sum, a) => sum + a.calories_burned, 0);

  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dayStr = d.toISOString().split('T')[0];
    const cal = db.prepare('SELECT SUM(calories) as total FROM food_logs WHERE user_id = ? AND date = ?').get(user.userId, dayStr) as { total: number };
    const burned = db.prepare('SELECT SUM(calories_burned) as total FROM activity_logs WHERE user_id = ? AND date = ?').get(user.userId, dayStr) as { total: number };
    last7Days.push({
      date: dayStr,
      calories_in: cal.total || 0,
      calories_burned: burned.total || 0,
    });
  }

  return NextResponse.json({
    profile,
    food_logs: foodLogs,
    activity_logs: activityLogs,
    water_total: waterTotal.total || 0,
    totals: {
      calories_in: totalCaloriesIn,
      calories_burned: totalCaloriesBurned,
      net_calories: totalCaloriesIn - totalCaloriesBurned,
    },
    last7Days,
  });
}
