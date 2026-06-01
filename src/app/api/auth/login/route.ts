import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { mockData } from '@/lib/data';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  let body: { email?: string; password?: string };

  try {
    body = await request.json();
  } catch (parseError) {
    console.error('Invalid JSON body in /api/auth/login:', parseError);
    return NextResponse.json({ success: false, message: 'Cuerpo JSON inválido.' }, { status: 400 });
  }

  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '').trim();

  if (!email || !password) {
    return NextResponse.json({ success: false, message: 'Email y contraseña son obligatorios.' }, { status: 400 });
  }

  try {
    type LoginRow = {
      id: number;
      nombre: string;
      apellido: string;
      email: string;
      cliente_id: number | null;
      rango: string | null;
      suscripcion: string | null;
      empleado_id: number | null;
      empleado_rol: string | null;
    };

    const result = await query<LoginRow>(
      `SELECT p.id, p.nombre, p.apellido, p.email,
              c.id as cliente_id, c.rango, c.suscripcion,
              e.id as empleado_id, e.rol as empleado_rol
       FROM persona p
       LEFT JOIN cliente c ON c.id_persona = p.id
       LEFT JOIN empleado e ON e.id_persona = p.id
       WHERE LOWER(p.email) = $1`,
      [email]
    );

    if ((result?.rowCount || 0) > 0) {
      const row = result.rows[0];
      const role = row.empleado_id ? 'empleado' : row.cliente_id ? 'cliente' : 'admin';
      const user = {
        id: row.id,
        nombre: row.nombre,
        apellido: row.apellido,
        email: row.email,
        role,
        rango: row.rango || null,
        suscripcion: row.suscripcion || null,
        rol: row.empleado_rol || null
      };

      return NextResponse.json({ success: true, user });
    }
  } catch (dbError) {
    console.warn('DB connection failed, fallback to mock auth:', dbError);
  }

  const cliente = mockData.clientes.find((item) => item.email.toLowerCase() === email);
  const empleado = mockData.empleados.find((item) => item.email.toLowerCase() === email);

  if (!cliente && !empleado) {
    return NextResponse.json({ success: false, message: 'Usuario no encontrado.' }, { status: 401 });
  }

  const user = cliente
    ? { ...cliente, role: 'cliente' }
    : { ...empleado, role: 'empleado' };

  return NextResponse.json({ success: true, user });
}
