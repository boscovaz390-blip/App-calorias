import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import getDb from '@/lib/db';
import { generateDailySummary } from '@/lib/claude';

export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  try {
    const { date } = await request.json();
    const targetDate = date || new Date().toISOString().split('T')[0];

    const db = getDb();
    const profile = db.prepare('SELECT * FROM user_profiles WHERE user_id = ?').get(user.userId) as {
      age: number; gender: string; weight_kg: number; height_cm: number;
      activity_level: string; goal: string; dietary_restrictions: string;
      daily_calorie_goal: number; daily_water_goal: number;
    } | undefined;

    if (!profile) return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 });

    const foods = db.prepare('SELECT food_name as name, calories, meal_type FROM food_logs WHERE user_id = ? AND date = ?').all(user.userId, targetDate) as Array<{ name: string; calories: number; meal_type: string }>;
    const activities = db.prepare('SELECT activity_name as name, duration_minutes as duration, calories_burned FROM activity_logs WHERE user_id = ? AND date = ?').all(user.userId, targetDate) as Array<{ name: string; duration: number; calories_burned: number }>;
    const waterResult = db.prepare('SELECT SUM(amount_ml) as total FROM water_logs WHERE user_id = ? AND date = ?').get(user.userId, targetDate) as { total: number };

    const { summary, score } = await generateDailySummary({
      userName: user.name,
      date: targetDate,
      foods,
      activities,
      water_ml: waterResult.total || 0,
      water_goal_ml: profile.daily_water_goal,
      calorie_goal: profile.daily_calorie_goal,
      profile: {
        name: user.name,
        age: profile.age,
        gender: profile.gender,
        weight_kg: profile.weight_kg,
        height_cm: profile.height_cm,
        activity_level: profile.activity_level,
        goal: profile.goal,
        daily_calorie_goal: profile.daily_calorie_goal,
      },
    });

    const totalCaloriesIn = foods.reduce((sum, f) => sum + f.calories, 0);
    const totalCaloriesBurned = activities.reduce((sum, a) => sum + a.calories_burned, 0);

    db.prepare(`
      INSERT INTO daily_summaries (user_id, date, summary_text, total_calories_in, total_calories_burned, total_water_ml, score)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id, date) DO UPDATE SET
        summary_text=excluded.summary_text, total_calories_in=excluded.total_calories_in,
        total_calories_burned=excluded.total_calories_burned, total_water_ml=excluded.total_water_ml,
        score=excluded.score, created_at=datetime('now')
    `).run(user.userId, targetDate, summary, totalCaloriesIn, totalCaloriesBurned, waterResult.total || 0, score);

    return NextResponse.json({ success: true, summary, score });
  } catch (error) {
    console.error('Summary error:', error);
    return NextResponse.json({ error: 'Error al generar resumen' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

  const db = getDb();
  const summary = db.prepare('SELECT * FROM daily_summaries WHERE user_id = ? AND date = ?').get(user.userId, date);

  return NextResponse.json({ summary });
}
