import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await query(
      `SELECT nombre, descripcion, precio, caracteristicas, limite_proyectos, badge_text
       FROM tipo_suscripcion
       ORDER BY precio ASC`
    );
    return NextResponse.json({ success: true, suscripciones: result.rows });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch subscriptions' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { nombre, precio, descripcion, caracteristicas, limite_proyectos, badge_text } = data;

    if (!nombre || precio === undefined) {
      return NextResponse.json({ success: false, message: 'Nombre and precio are required' }, { status: 400 });
    }

    const result = await query(
      `INSERT INTO tipo_suscripcion (nombre, precio, descripcion, caracteristicas, limite_proyectos, badge_text)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [nombre, precio, descripcion, caracteristicas || {}, limite_proyectos ?? -1, badge_text || '']
    );

    return NextResponse.json({ success: true, suscripcion: result.rows[0] });
  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json({ success: false, message: 'Failed to create subscription' }, { status: 500 });
  }
}
