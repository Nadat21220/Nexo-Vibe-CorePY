import { NextResponse } from 'next/server';
import { mockData } from '@/lib/data';

export async function GET() {
  return NextResponse.json({ objetivos: mockData.objetivos });
}

export async function PUT(request: Request) {
  const body = await request.json();
  const { objetivos } = body;
  
  if (objetivos && Array.isArray(objetivos)) {
    mockData.objetivos = objetivos;
    return NextResponse.json({ success: true, objetivos: mockData.objetivos });
  }

  return NextResponse.json({ success: false, message: "Datos inválidos" }, { status: 400 });
}
