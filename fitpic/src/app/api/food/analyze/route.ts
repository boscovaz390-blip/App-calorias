import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { analyzeFoodPhoto } from '@/lib/claude';

export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json({ error: 'No se proporcionó imagen' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const mimeType = file.type || 'image/jpeg';

    const analysis = await analyzeFoodPhoto(base64, mimeType);

    return NextResponse.json({ success: true, analysis });
  } catch (error) {
    console.error('Food analysis error:', error);
    return NextResponse.json({ error: 'Error al analizar la imagen' }, { status: 500 });
  }
}
