import { NextResponse } from 'next/server';
import { mockData } from '@/lib/data';

if (!(mockData as any).eventos) {
  (mockData as any).eventos = [];
}

export async function GET() {
  return NextResponse.json({
    eventos: (mockData as any).eventos
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { data } = body;
  const newEvento = { id: `ev_${Date.now()}`, ...data };
  (mockData as any).eventos.push(newEvento);
  return NextResponse.json({ success: true, evento: newEvento });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (id) {
    const index = (mockData as any).eventos.findIndex((e: any) => e.id === id);
    if (index !== -1) {
      (mockData as any).eventos.splice(index, 1);
      return NextResponse.json({ success: true });
    }
  }
  return NextResponse.json({ success: false }, { status: 404 });
}

export async function PUT(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const body = await request.json();
  const { data } = body;

  if (id) {
    const index = (mockData as any).eventos.findIndex((e: any) => e.id === id);
    if (index !== -1) {
      (mockData as any).eventos[index] = { ...((mockData as any).eventos[index]), ...data };
      return NextResponse.json({ success: true, evento: (mockData as any).eventos[index] });
    }
  }
  return NextResponse.json({ success: false }, { status: 404 });
}
