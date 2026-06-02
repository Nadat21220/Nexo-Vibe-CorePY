import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ success: false, message: 'Email is required' }, { status: 400 });
    }

    const result = await query(
      `SELECT ts.nombre as tier, ts.limite_proyectos, c.suscripcion as status
       FROM cliente c
       JOIN persona p ON p.id = c.id_persona
       LEFT JOIN tipo_suscripcion ts ON c.suscripcion = ts.nombre
       WHERE p.email = $1`,
      [email]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ success: false, message: 'Cliente not found' }, { status: 404 });
    }

    const sub = result.rows[0];
    let maxProjects = 'Ilimitado';
    if (sub.limite_proyectos !== null && sub.limite_proyectos !== -1) {
      maxProjects = `${sub.limite_proyectos} Proyecto${sub.limite_proyectos === 1 ? '' : 's'}`;
    }

    return NextResponse.json({ 
      success: true, 
      subscription: {
        tier: sub.tier,
        maxProjects,
        startDate: '2026-01-15', // Mocked as we don't have this in DB yet
        status: 'Activa'
      }
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch subscription' }, { status: 500 });
  }
}
