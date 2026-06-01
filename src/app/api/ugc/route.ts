import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { mockData } from '@/lib/data';

export async function GET() {
  return NextResponse.json({
    creadores: mockData.creadores || []
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { data } = body;
  const newCreador = { id: `u_${Date.now()}`, ...data };
  mockData.creadores.push(newCreador);
  return NextResponse.json({ success: true, creador: newCreador });
}

export async function PUT(request: Request) {
  const body = await request.json();
  const { data } = body;
  const index = (mockData.creadores || []).findIndex((u) => u.id === data.id);
  if (index !== -1) {
    mockData.creadores[index] = { ...mockData.creadores[index], ...data };
    return NextResponse.json({ success: true, creador: mockData.creadores[index] });
  }
  return NextResponse.json({ success: false }, { status: 404 });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (id) {
    const index = (mockData.creadores || []).findIndex((u) => u.id === id);
    if (index !== -1) {
      mockData.creadores.splice(index, 1);
      return NextResponse.json({ success: true });
    }
  }
  return NextResponse.json({ success: false }, { status: 404 });
}
