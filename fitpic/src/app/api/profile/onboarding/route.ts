import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import getDb from '@/lib/db';
import { calculateCalorieGoal, generateAIPlan } from '@/lib/claude';

export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  try {
    const body = await request.json();
    const {
      age, gender, weight_kg, height_cm, activity_level, goal,
      dietary_restrictions, health_conditions, target_weight_kg,
    } = body;

    const calorie_goal = await calculateCalorieGoal({
      name: user.name, age, gender, weight_kg, height_cm,
      activity_level, goal, dietary_restrictions, health_conditions,
      target_weight_kg,
    });

    const water_goal = Math.round(weight_kg * 35);

    const db = getDb();

    db.prepare(`
      INSERT INTO user_profiles (user_id, age, gender, weight_kg, height_cm, activity_level, goal, dietary_restrictions, health_conditions, target_weight_kg, daily_calorie_goal, daily_water_goal)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET
        age=excluded.age, gender=excluded.gender, weight_kg=excluded.weight_kg,
        height_cm=excluded.height_cm, activity_level=excluded.activity_level,
        goal=excluded.goal, dietary_restrictions=excluded.dietary_restrictions,
        health_conditions=excluded.health_conditions, target_weight_kg=excluded.target_weight_kg,
        daily_calorie_goal=excluded.daily_calorie_goal, daily_water_goal=excluded.daily_water_goal,
        updated_at=datetime('now')
    `).run(user.userId, age, gender, weight_kg, height_cm, activity_level, goal,
      dietary_restrictions || '', health_conditions || '', target_weight_kg || null,
      calorie_goal, water_goal);

    db.prepare('UPDATE users SET onboarding_completed = 1 WHERE id = ?').run(user.userId);

    const plan = await generateAIPlan({
      name: user.name, age, gender, weight_kg, height_cm, activity_level,
      goal, dietary_restrictions, health_conditions, target_weight_kg, daily_calorie_goal: calorie_goal,
    });

    db.prepare(`
      INSERT INTO ai_plans (user_id, plan_text)
      VALUES (?, ?)
      ON CONFLICT(user_id) DO UPDATE SET plan_text=excluded.plan_text, generated_at=datetime('now')
    `).run(user.userId, plan);

    return NextResponse.json({
      success: true,
      calorie_goal,
      water_goal,
      plan,
    });
  } catch (error) {
    console.error('Onboarding error:', error);
    return NextResponse.json({ error: 'Error al procesar el perfil' }, { status: 500 });
  }
}
