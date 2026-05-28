import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { mockData } from '@/lib/data';

export async function GET() {
  try {
    const [resProyectos, resEmpleados, resClientes] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/proyectos`, { cache: 'no-store' }),
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/empleados`, { cache: 'no-store' }),
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/clientes`, { cache: 'no-store' })
    ]);
    
    const dataProyectos = await resProyectos.json();
    const dataEmpleados = await resEmpleados.json();
    const dataClientes = await resClientes.json();

    return NextResponse.json({ 
      tareas: dataProyectos.success ? dataProyectos.tareas : [], 
      empleados: dataEmpleados.success ? dataEmpleados.empleados : [], 
      campanas: mockData.campanas, 
      clientes: dataClientes.success ? dataClientes.clientes : []
    });
  } catch (err) {
    console.error("Error fetching from python API:", err);
    return NextResponse.json({ 
      tareas: [], 
      empleados: [], 
      campanas: mockData.campanas, 
      clientes: [] 
    });
  }
}

export async function PUT(request: Request) {
  const body = await request.json();
  const { id, ...updates } = body;
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/proyectos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("Error updating via python API:", err);
    return NextResponse.json({ success: false, message: "Error interno" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/proyectos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("Error creating via python API:", err);
    return NextResponse.json({ success: false, message: "Error interno" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) return NextResponse.json({ success: false, message: "ID is required" }, { status: 400 });

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/proyectos/${id}`, {
      method: 'DELETE'
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("Error deleting via python API:", err);
    return NextResponse.json({ success: false, message: "Error interno" }, { status: 500 });
  }
}
