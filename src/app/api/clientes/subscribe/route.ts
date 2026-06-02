import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { email, suscripcion } = data;

    if (!email || !suscripcion) {
      return NextResponse.json({ success: false, message: 'Email and suscripcion are required' }, { status: 400 });
    }

    const result = await query(
      `UPDATE cliente 
       SET suscripcion = $1 
       FROM persona 
       WHERE cliente.id_persona = persona.id AND persona.email = $2
       RETURNING cliente.id, persona.email, cliente.suscripcion`,
      [suscripcion, email]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ success: false, message: 'Cliente not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, cliente: result.rows[0] });
  } catch (error) {
    console.error('Error updating subscription:', error);
    return NextResponse.json({ success: false, message: 'Failed to update subscription' }, { status: 500 });
  }
}
