import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface FoodAnalysis {
  food_name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  portion_size: string;
  confidence: 'high' | 'medium' | 'low';
  tips: string;
  alternatives?: string;
}

export async function analyzeFoodPhoto(base64Image: string, mimeType: string): Promise<FoodAnalysis> {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mimeType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
              data: base64Image,
            },
          },
          {
            type: 'text',
            text: `Analyzes this food image and provide nutritional information. Respond ONLY with valid JSON in this exact format:
{
  "food_name": "Name of the food/dish",
  "calories": 000,
  "protein_g": 00,
  "carbs_g": 00,
  "fat_g": 00,
  "fiber_g": 00,
  "portion_size": "approximate portion description",
  "confidence": "high|medium|low",
  "tips": "brief health tip about this food in Spanish",
  "alternatives": "healthier alternative suggestion in Spanish"
}

Be precise with calorie estimates based on visible portion size. Respond in JSON only, no markdown.`,
          },
        ],
      },
    ],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(cleaned) as FoodAnalysis;
}

export interface UserProfile {
  name: string;
  age: number;
  gender: string;
  weight_kg: number;
  height_cm: number;
  activity_level: string;
  goal: string;
  dietary_restrictions?: string;
  health_conditions?: string;
  target_weight_kg?: number;
  daily_calorie_goal?: number;
}

export async function generateAIPlan(profile: UserProfile): Promise<string> {
  const bmi = profile.weight_kg / Math.pow(profile.height_cm / 100, 2);

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: `Eres un experto nutricionista y entrenador personal. Crea un plan de acción personalizado en español para:

Nombre: ${profile.name}
Edad: ${profile.age} años
Género: ${profile.gender}
Peso: ${profile.weight_kg} kg
Altura: ${profile.height_cm} cm
IMC: ${bmi.toFixed(1)}
Nivel de actividad: ${profile.activity_level}
Objetivo: ${profile.goal}
${profile.target_weight_kg ? `Peso objetivo: ${profile.target_weight_kg} kg` : ''}
${profile.dietary_restrictions ? `Restricciones: ${profile.dietary_restrictions}` : ''}
${profile.health_conditions ? `Condiciones de salud: ${profile.health_conditions}` : ''}
Meta calórica diaria: ${profile.daily_calorie_goal} kcal

Crea un plan completo en formato Markdown con:
1. **Evaluación inicial** - análisis del perfil y IMC
2. **Objetivo calórico diario** - con justificación
3. **Plan nutricional** - distribución de macros y ejemplos de comidas
4. **Rutina de ejercicios** - específica para su nivel y objetivo (semana típica)
5. **Hidratación** - recomendaciones de agua diaria
6. **Tips personalizados** - 5 consejos específicos para su perfil
7. **Progreso esperado** - timeline realista de resultados

Sé específico, motivador y científicamente preciso. Usa emojis para hacer el plan más visual.`,
      },
    ],
  });

  return response.content[0].type === 'text' ? response.content[0].text : '';
}

export interface DailySummaryData {
  userName: string;
  date: string;
  foods: Array<{ name: string; calories: number; meal_type: string }>;
  activities: Array<{ name: string; duration: number; calories_burned: number }>;
  water_ml: number;
  water_goal_ml: number;
  calorie_goal: number;
  profile: UserProfile;
}

export async function generateDailySummary(data: DailySummaryData): Promise<{ summary: string; score: number }> {
  const totalCaloriesIn = data.foods.reduce((sum, f) => sum + f.calories, 0);
  const totalCaloriesBurned = data.activities.reduce((sum, a) => sum + a.calories_burned, 0);
  const netCalories = totalCaloriesIn - totalCaloriesBurned;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `Eres un coach de salud personal. Genera un resumen del día para ${data.userName} el ${data.date}.

DATOS DEL DÍA:
- Calorías consumidas: ${totalCaloriesIn} kcal (meta: ${data.calorie_goal} kcal)
- Calorías quemadas: ${totalCaloriesBurned} kcal
- Calorías netas: ${netCalories} kcal
- Agua: ${data.water_ml} ml (meta: ${data.water_goal_ml} ml)
- Comidas: ${data.foods.map(f => `${f.meal_type}: ${f.name} (${f.calories} kcal)`).join(', ') || 'Sin registros'}
- Actividades: ${data.activities.map(a => `${a.name} ${a.duration}min`).join(', ') || 'Sin actividad'}
- Objetivo del usuario: ${data.profile.goal}

Responde SOLO con JSON válido:
{
  "summary": "resumen motivador y personalizado en español con análisis del día, logros, áreas de mejora y motivación para mañana. Usa emojis. Mínimo 150 palabras.",
  "score": número del 1 al 100 basado en qué tan bien siguió sus metas
}`,
      },
    ],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(cleaned);
}

export async function calculateCalorieGoal(profile: UserProfile): Promise<number> {
  let bmr: number;
  if (profile.gender === 'male') {
    bmr = 88.362 + 13.397 * profile.weight_kg + 4.799 * profile.height_cm - 5.677 * profile.age;
  } else {
    bmr = 447.593 + 9.247 * profile.weight_kg + 3.098 * profile.height_cm - 4.330 * profile.age;
  }

  const activityMultipliers: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };

  const tdee = bmr * (activityMultipliers[profile.activity_level] || 1.55);

  const goalAdjustments: Record<string, number> = {
    lose_weight: -500,
    lose_weight_fast: -750,
    maintain: 0,
    gain_muscle: 250,
    gain_weight: 500,
  };

  return Math.round(tdee + (goalAdjustments[profile.goal] || 0));
}
