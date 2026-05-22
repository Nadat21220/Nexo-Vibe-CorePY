import { NextResponse } from 'next/server';
import { mockData } from '@/lib/data';

export async function GET() {
  return NextResponse.json({
    campanas: mockData.campanas,
    clientes: mockData.clientes,
    empleados: mockData.empleados,
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { type, data } = body;
  
  if (type === 'cliente') {
    const newCliente = { id: `cl_${Date.now()}`, ...data };
    mockData.clientes.push(newCliente);
    return NextResponse.json({ success: true, cliente: newCliente });
  } else if (type === 'empleado') {
    const newEmpleado = { id: `emp_${Date.now()}`, estado: 'ACTIVE', ...data };
    mockData.empleados.push(newEmpleado);
    return NextResponse.json({ success: true, empleado: newEmpleado });
  } else if (type === 'campana') {
    const newCampana = { id: `camp_${Date.now()}`, status: 'ACTIVE', ...data };
    mockData.campanas.push(newCampana);
    return NextResponse.json({ success: true, campana: newCampana });
  }
  
  return NextResponse.json({ success: false }, { status: 400 });
}

export async function PUT(request: Request) {
  const body = await request.json();
  const { type, data } = body;
  
  if (type === 'cliente') {
    const index = mockData.clientes.findIndex((c: any) => c.id === data.id);
    if (index !== -1) {
      mockData.clientes[index] = { ...mockData.clientes[index], ...data };
      return NextResponse.json({ success: true, cliente: mockData.clientes[index] });
    }
  } else if (type === 'empleado') {
    const index = mockData.empleados.findIndex((e: any) => e.id === data.id);
    if (index !== -1) {
      mockData.empleados[index] = { ...mockData.empleados[index], ...data };
      return NextResponse.json({ success: true, empleado: mockData.empleados[index] });
    }
  } else if (type === 'campana') {
    const index = mockData.campanas.findIndex((c: any) => c.id === data.id);
    if (index !== -1) {
      mockData.campanas[index] = { ...mockData.campanas[index], ...data };
      return NextResponse.json({ success: true, campana: mockData.campanas[index] });
    }
  }
  
  return NextResponse.json({ success: false }, { status: 404 });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const type = searchParams.get('type');

  if (!id || !type) return NextResponse.json({ success: false, message: "ID and Type are required" }, { status: 400 });

  if (type === 'cliente') {
    const index = mockData.clientes.findIndex(c => c.id === id);
    if (index > -1) {
      mockData.clientes.splice(index, 1);
      return NextResponse.json({ success: true });
    }
  } else if (type === 'empleado') {
    const index = mockData.empleados.findIndex(e => e.id === id);
    if (index > -1) {
      mockData.empleados.splice(index, 1);
      return NextResponse.json({ success: true });
    }
  } else if (type === 'campana') {
    const index = mockData.campanas.findIndex(c => c.id === id);
    if (index > -1) {
      mockData.campanas.splice(index, 1);
      return NextResponse.json({ success: true });
    }
  }

  return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
}
