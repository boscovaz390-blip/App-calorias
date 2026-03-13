import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import getDb from '@/lib/db';

export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const db = getDb();
  const plan = db.prepare('SELECT * FROM ai_plans WHERE user_id = ?').get(user.userId) as {
    plan_text: string; generated_at: string;
  } | undefined;

  if (!plan) return NextResponse.json({ error: 'Plan no encontrado' }, { status: 404 });

  return NextResponse.json({ plan: plan.plan_text, generated_at: plan.generated_at });
}
