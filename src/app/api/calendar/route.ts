import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { mockData } from '@/lib/data';

const eventos = mockData.eventos ?? [];

export async function GET() {
  return NextResponse.json({
    eventos
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { data } = body;
  const newEvento = { id: `ev_${Date.now()}`, ...data };
  mockData.eventos.push(newEvento);
  return NextResponse.json({ success: true, evento: newEvento });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (id) {
    const index = mockData.eventos.findIndex((e) => e.id === id);
    if (index !== -1) {
      mockData.eventos.splice(index, 1);
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
    const index = mockData.eventos.findIndex((e) => e.id === id);
    if (index !== -1) {
      mockData.eventos[index] = { ...mockData.eventos[index], ...data };
      return NextResponse.json({ success: true, evento: mockData.eventos[index] });
    }
  }
  return NextResponse.json({ success: false }, { status: 404 });
}
