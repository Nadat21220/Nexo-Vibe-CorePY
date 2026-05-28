import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { mockData } from '@/lib/data';

export async function GET() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/creadores`, { cache: 'no-store' });
    const data = await res.json();
    return NextResponse.json({
      creadores: data.success ? data.creadores : []
    });
  } catch (err) {
    console.error("Error fetching creadores from python API:", err);
    return NextResponse.json({
      creadores: []
    });
  }
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
  const index = mockData.creadores.findIndex((u: any) => u.id === data.id);
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
    const index = mockData.creadores.findIndex((u: any) => u.id === id);
    if (index !== -1) {
      mockData.creadores.splice(index, 1);
      return NextResponse.json({ success: true });
    }
  }
  return NextResponse.json({ success: false }, { status: 404 });
}
