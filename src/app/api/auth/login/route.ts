import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  
  if (body.email && body.password) {
    let role = "cliente";
    const email = body.email.toLowerCase();
    
    if (email.endsWith(".com")) {
      role = "admin";
    } else if (email.endsWith(".net")) {
      role = "empleado";
    } else if (email.endsWith(".mx")) {
      role = "cliente";
    }

    // Mock successful login
    return NextResponse.json({ 
      success: true, 
      user: { 
        uid: "mock-" + role, 
        email: body.email, 
        role: role 
      } 
    });
  }

  return NextResponse.json({ success: false, message: "Credenciales inválidas" }, { status: 401 });
}
