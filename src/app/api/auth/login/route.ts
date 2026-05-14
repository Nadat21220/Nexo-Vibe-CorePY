import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  
  if (body.email && body.password) {
    let role = "cliente";
    if (body.email.includes("admin")) role = "admin";
    else if (body.email.includes("empleado")) role = "empleado";

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
