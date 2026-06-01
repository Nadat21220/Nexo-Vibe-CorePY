import { NextResponse } from 'next/server';
import { mockData } from '@/lib/data';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

type ClienteRow = {
  persona_id: number;
  nombre: string;
  apellido: string;
  email: string;
  cliente_id: number;
  telefono: string | null;
  direccion: string | null;
  rango: string | null;
  suscripcion: string | null;
};

type EmpleadoRow = {
  persona_id: number;
  nombre: string;
  apellido: string;
  email: string;
  empleado_id: number;
  rol: string | null;
  salario: number | null;
};

export async function GET() {
  try {
    const clientesResult = await query<ClienteRow>(
      `SELECT p.id as persona_id, p.nombre, p.apellido, p.email, c.id as cliente_id, c.telefono, c.direccion, c.rango, c.suscripcion
       FROM persona p
       JOIN cliente c ON c.id_persona = p.id
       ORDER BY p.nombre, p.apellido`
    );

    const empleadosResult = await query<EmpleadoRow>(
      `SELECT p.id as persona_id, p.nombre, p.apellido, p.email, e.id as empleado_id, e.rol, e.salario
       FROM persona p
       JOIN empleado e ON e.id_persona = p.id
       ORDER BY p.nombre, p.apellido`
    );

    const clientes = clientesResult.rows.map((row) => ({
      id: String(row.cliente_id),
      nombre: row.nombre,
      apellido: row.apellido,
      email: row.email,
      telefono: row.telefono,
      direccion: row.direccion,
      rango: row.rango,
      suscripcion: row.suscripcion
    }));

    const empleados = empleadosResult.rows.map((row) => ({
      id: String(row.empleado_id),
      nombre: row.nombre,
      apellido: row.apellido,
      email: row.email,
      rol: row.rol,
      salario: row.salario
    }));

    return NextResponse.json({
      campanas: mockData.campanas || [],
      clientes,
      empleados
    });
  } catch (err) {
    console.error('Error fetching socios data:', err);
    return NextResponse.json({
      campanas: mockData.campanas || [],
      clientes: mockData.clientes || [],
      empleados: mockData.empleados || []
    });
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const { type, data } = body;

  if (!type || !data) {
    return NextResponse.json({ success: false, message: 'Datos inválidos' }, { status: 400 });
  }

  if (type === 'cliente') {
    const newClient = { id: `cl_${Date.now()}`, ...data };
    mockData.clientes.push(newClient);
    return NextResponse.json({ success: true, cliente: newClient });
  }

  const newEmpleado = { id: `emp_${Date.now()}`, ...data };
  mockData.empleados.push(newEmpleado);
  return NextResponse.json({ success: true, empleado: newEmpleado });
}

export async function PUT(request: Request) {
  const body = await request.json();
  const { type, data } = body;

  if (!type || !data || !data.id) {
    return NextResponse.json({ success: false, message: 'Datos inválidos' }, { status: 400 });
  }

  if (type === 'cliente') {
    const index = (mockData.clientes || []).findIndex((c) => c.id === data.id);
    if (index === -1) return NextResponse.json({ success: false, message: 'Cliente no encontrado' }, { status: 404 });
    mockData.clientes[index] = { ...mockData.clientes[index], ...data };
    return NextResponse.json({ success: true, cliente: mockData.clientes[index] });
  }

  const index = (mockData.empleados || []).findIndex((e) => e.id === data.id);
  if (index === -1) return NextResponse.json({ success: false, message: 'Empleado no encontrado' }, { status: 404 });
  mockData.empleados[index] = { ...mockData.empleados[index], ...data };
  return NextResponse.json({ success: true, empleado: mockData.empleados[index] });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const type = searchParams.get('type');

  if (!id || !type) {
    return NextResponse.json({ success: false, message: 'ID and Type are required' }, { status: 400 });
  }

  if (type === 'cliente') {
    const index = (mockData.clientes || []).findIndex((c) => c.id === id);
    if (index === -1) return NextResponse.json({ success: false, message: 'Cliente no encontrado' }, { status: 404 });
    mockData.clientes.splice(index, 1);
    return NextResponse.json({ success: true });
  }

  const index = (mockData.empleados || []).findIndex((e) => e.id === id);
  if (index === -1) return NextResponse.json({ success: false, message: 'Empleado no encontrado' }, { status: 404 });
  mockData.empleados.splice(index, 1);
  return NextResponse.json({ success: true });
}
