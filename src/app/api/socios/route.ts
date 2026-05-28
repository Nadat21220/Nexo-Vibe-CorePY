import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { mockData } from '@/lib/data';

const ADMIN_EMAILS = new Set([
  'tomas.cedillo@nexovibe.com', 'flor.sarmiento@nexovibe.com', 'marco.villasenor@nexovibe.com',
  'julia.aguirre@nexovibe.com', 'ruben.montero@nexovibe.com', 'cecilia.padilla@nexovibe.com',
  'victor.bravo@nexovibe.com', 'noemi.camacho@nexovibe.com', 'erick.valencia@nexovibe.com',
  'mia.sotelo@nexovibe.com', 'gilberto.cuevas@nexovibe.com', 'romina.becerra@nexovibe.com'
]);

export async function GET() {
  try {
    const [resEmpleados, resClientes, resCreadores] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/empleados`, { cache: 'no-store' }),
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/clientes`, { cache: 'no-store' }),
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/creadores`, { cache: 'no-store' })
    ]);
    const dataEmpleados = await resEmpleados.json();
    const dataClientes = await resClientes.json();
    const dataCreadores = await resCreadores.json();

    const normalEmpleados = dataEmpleados.success
      ? dataEmpleados.empleados.map((e: any) => ({ ...e, id: `emp_${e.id}` }))
      : [];
    const allCreadores = dataCreadores.success ? dataCreadores.creadores : [];
    
    const creatorStaff = allCreadores.map((c: any) => {
      const isAdmin = ADMIN_EMAILS.has(c.email.toLowerCase());
      return {
        id: `cre_${c.id}`,
        nombre: c.nombre,
        apellido: c.apellido,
        email: c.email,
        rol: isAdmin ? 'Administrador' : 'Creador UGC',
        estado: 'ACTIVE'
      };
    });

    const combinedEmpleados = [...creatorStaff, ...normalEmpleados];
    const normalClientes = dataClientes.success
      ? dataClientes.clientes.map((c: any) => ({ ...c, id: `cli_${c.id}` }))
      : [];

    return NextResponse.json({
      campanas: mockData.campanas,
      clientes: normalClientes,
      empleados: combinedEmpleados,
    });
  } catch (err) {
    console.error("Error fetching socios from python API:", err);
    return NextResponse.json({
      campanas: mockData.campanas,
      clientes: [],
      empleados: [],
    });
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const { type, data } = body;
  
  try {
    const endpoint = type === 'cliente' ? 'clientes' : 'empleados';
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const resData = await res.json();
    return NextResponse.json(resData);
  } catch (err) {
    console.error("Error creating via python API:", err);
    return NextResponse.json({ success: false, message: "Error interno" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const body = await request.json();
  const { type, data } = body;
  
  try {
    let endpoint = type === 'cliente' ? 'clientes' : 'empleados';
    let cleanId = data.id;
    if (data.id) {
      if (data.id.startsWith('cre_')) {
        endpoint = 'creadores';
        cleanId = data.id.substring(4);
      } else if (data.id.startsWith('emp_')) {
        endpoint = 'empleados';
        cleanId = data.id.substring(4);
      } else if (data.id.startsWith('cli_')) {
        endpoint = 'clientes';
        cleanId = data.id.substring(4);
      }
    }
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/${endpoint}/${cleanId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, id: cleanId })
    });
    const resData = await res.json();
    return NextResponse.json(resData);
  } catch (err) {
    console.error("Error updating via python API:", err);
    return NextResponse.json({ success: false, message: "Error interno" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const type = searchParams.get('type');

  if (!id || !type) return NextResponse.json({ success: false, message: "ID and Type are required" }, { status: 400 });

  try {
    let endpoint = type === 'cliente' ? 'clientes' : 'empleados';
    let cleanId = id;
    if (id.startsWith('cre_')) {
      endpoint = 'creadores';
      cleanId = id.substring(4);
    } else if (id.startsWith('emp_')) {
      endpoint = 'empleados';
      cleanId = id.substring(4);
    } else if (id.startsWith('cli_')) {
      endpoint = 'clientes';
      cleanId = id.substring(4);
    }
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/${endpoint}/${cleanId}`, {
      method: 'DELETE'
    });
    const resData = await res.json();
    return NextResponse.json(resData);
  } catch (err) {
    console.error("Error deleting via python API:", err);
    return NextResponse.json({ success: false, message: "Error interno" }, { status: 500 });
  }
}
